import "server-only";

import { StudioBridgeError, StudioNotFound } from "@/lib/studio/errors";
import type {
  ActorRecord,
  Client,
  DataSource,
  DeliveryStatus,
  ListClientsInput,
  ListProjectsInput,
  ListTasksInput,
  Milestone,
  Page,
  PipelineSummary,
  Project,
  SearchHit,
  SearchInput,
  StudioClient,
  Task,
  TaskRecord,
  WorkspaceContext,
} from "@/lib/studio/types";
import { DATA_SOURCES } from "@/lib/studio/types";

interface ToolFailure {
  ok: false;
  source?: DataSource;
  error?: { code?: string; message?: string };
}

interface ToolSuccess<T> {
  ok: true;
  source?: DataSource;
  data: T;
}

/**
 * HTTP bridge in front of lunarcore-mcp. The MCP server itself is stdio-only.
 * This adapter never reads ClickUp tokens. Point STUDIO_HTTP_BASE_URL at a BFF.
 */
export function createHttpStudioClient(env: NodeJS.ProcessEnv = process.env): StudioClient {
  const base = env.STUDIO_HTTP_BASE_URL?.trim();
  if (!base) {
    throw new StudioBridgeError(
      "invalid",
      "STUDIO_SOURCE=http needs STUDIO_HTTP_BASE_URL. The web app does not call ClickUp directly.",
    );
  }

  const token = env.STUDIO_HTTP_TOKEN?.trim();
  let source: DataSource = "clickup";

  async function request<T>(path: string): Promise<T> {
    const headers = new Headers({ Accept: "application/json" });
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let response: Response;
    try {
      response = await fetch(resolveUrl(base!, path), {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      throw new StudioBridgeError("invalid", `Studio bridge unreachable: ${message}`);
    }

    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const failure = asFailure(body);
      throw bridgeError(failure, `Studio bridge returned ${response.status} for ${path}.`);
    }

    if (!isRecord(body) || body.ok !== true || !("data" in body)) {
      throw new StudioBridgeError("invalid", "Studio bridge returned a body that is not a tool envelope.");
    }

    const success = body as unknown as ToolSuccess<T>;
    if (success.source && isDataSource(success.source)) source = success.source;
    return success.data;
  }

  const client: StudioClient = {
    transport: "http",
    get source() {
      return source;
    },
    async whoami() {
      return request<ActorRecord>("/v1/whoami");
    },
    async workspaceContext() {
      return request<WorkspaceContext>("/v1/workspace");
    },
    async listClients(input: ListClientsInput = {}) {
      return request<Page<Client>>(`/v1/clients${queryString(input)}`);
    },
    async getClient(id: string) {
      try {
        const data = await request<{ client: Client }>(`/v1/clients/${encodeURIComponent(id)}`);
        return data.client;
      } catch (error) {
        rethrowNotFound(error);
      }
    },
    async listProjects(input: ListProjectsInput = {}) {
      return request<Page<Project>>(`/v1/projects${queryString(input)}`);
    },
    async getProject(id: string) {
      try {
        const data = await request<{ project: Project }>(`/v1/projects/${encodeURIComponent(id)}`);
        return data.project;
      } catch (error) {
        rethrowNotFound(error);
      }
    },
    async listMilestones(projectId: string) {
      return request<Page<Milestone>>(`/v1/milestones${queryString({ projectId })}`);
    },
    async listTasks(input: ListTasksInput = {}) {
      return request<Page<Task>>(`/v1/tasks${queryString(input)}`);
    },
    async getTask(id: string) {
      try {
        return await request<TaskRecord>(`/v1/tasks/${encodeURIComponent(id)}`);
      } catch (error) {
        rethrowNotFound(error);
      }
    },
    async deliveryStatus(projectId: string) {
      try {
        return await request<DeliveryStatus>(`/v1/projects/${encodeURIComponent(projectId)}/delivery`);
      } catch (error) {
        rethrowNotFound(error);
      }
    },
    async pipelineSummary() {
      try {
        const summary = await request<PipelineSummary>("/v1/pipeline");
        return { available: true, summary };
      } catch (error) {
        if (error instanceof StudioBridgeError && error.code === "not_implemented") {
          return { available: false, reason: error.message };
        }
        throw error;
      }
    },
    async listMembers() {
      return request<Page<import("@/lib/studio/types").Member>>("/v1/members");
    },
    async search(input: SearchInput) {
      return request<Page<SearchHit>>(`/v1/search${queryString({ query: input.query, limit: input.limit })}`);
    },
  };

  return client;
}

function rethrowNotFound(error: unknown): never {
  if (error instanceof StudioBridgeError && error.code === "not_found") {
    throw new StudioNotFound(error.message);
  }
  throw error;
}

function bridgeError(failure: ToolFailure | null, fallback: string): StudioBridgeError {
  const code = failure?.error?.code ?? "invalid";
  const message = failure?.error?.message ?? fallback;
  return new StudioBridgeError(code, message);
}

function asFailure(body: unknown): ToolFailure | null {
  if (!isRecord(body) || body.ok !== false) return null;
  return body as unknown as ToolFailure;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDataSource(value: string): value is DataSource {
  return (DATA_SOURCES as readonly string[]).includes(value);
}

function queryString(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

function resolveUrl(base: string, path: string): string {
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return new URL(path.replace(/^\//, ""), normalized).toString();
}
