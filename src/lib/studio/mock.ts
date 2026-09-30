import "server-only";

import { rollupDelivery } from "@/lib/studio/delivery";
import { StudioNotFound } from "@/lib/studio/errors";
import { createSeed, type StudioSeed } from "@/lib/studio/seed";
import type {
  Actor,
  Client,
  ClientStatus,
  IntegrationPresence,
  LeadStage,
  ListClientsInput,
  ListProjectsInput,
  ListReviewsInput,
  ListShootsInput,
  ListTasksInput,
  Member,
  Page,
  PipelineSummary,
  Project,
  ProposalStatus,
  Review,
  ReviewStatus,
  SearchHit,
  SearchInput,
  Shoot,
  ShootStatus,
  StudioClient,
  Task,
  WorkspaceContext,
} from "@/lib/studio/types";
import { LEAD_STAGES, PROPOSAL_STATUSES, REVIEW_STATUSES, SHOOT_STATUSES } from "@/lib/studio/types";

const EMPTY_INTEGRATIONS: IntegrationPresence = {
  clickup: { configured: false, present: { apiToken: false, teamId: false } },
  google: {
    configured: false,
    present: { clientId: false, clientSecret: false, refreshToken: false },
  },
};

function read(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function paginate<T>(items: T[], limit: number | undefined): Page<T> {
  const size = Math.min(Math.max(limit ?? 50, 1), 200);
  return { items: items.slice(0, size), total: items.length };
}

function includesFold(query: string, value: string | undefined): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

function matchesAny(query: string, values: Array<string | undefined>): boolean {
  return values.some((value) => includesFold(query, value));
}

function sortByUpdated<T extends { updatedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.updatedAt.localeCompare(b.updatedAt));
}

export function createMockStudioClient(env: NodeJS.ProcessEnv = process.env, now = new Date()): StudioClient {
  const seed = createSeed(now);
  const actor: Actor = {
    id: "actor_operator",
    name: read(env.LUNARCORE_ACTOR_NAME, "Lunarcore Operator"),
    email: read(env.LUNARCORE_ACTOR_EMAIL, "operator@lunarcore.studio"),
    role: read(env.LUNARCORE_ACTOR_ROLE, "producer"),
  };
  const workspaceName = read(env.LUNARCORE_WORKSPACE_NAME, "Lunarcore Studios");

  const clients = new Map(seed.clients.map((client) => [client.id, client]));
  const projects = new Map(seed.projects.map((project) => [project.id, project]));
  const members = new Map(seed.members.map((member) => [member.id, member]));

  function requireClient(id: string): Client {
    const client = clients.get(id);
    if (!client) throw new StudioNotFound(`No client with id ${id}.`);
    return client;
  }

  function requireProject(id: string): Project {
    const project = projects.get(id);
    if (!project) throw new StudioNotFound(`No project with id ${id}.`);
    return project;
  }

  function requireTask(id: string): Task {
    const task = seed.tasks.find((item) => item.id === id);
    if (!task) throw new StudioNotFound(`No task with id ${id}.`);
    return task;
  }

  function requireShoot(id: string): Shoot {
    const shoot = seed.shoots.find((item) => item.id === id);
    if (!shoot) throw new StudioNotFound(`No shoot with id ${id}.`);
    return shoot;
  }

  function requireReview(id: string): Review {
    const review = seed.reviews.find((item) => item.id === id);
    if (!review) throw new StudioNotFound(`No review with id ${id}.`);
    return review;
  }

  const client: StudioClient = {
    transport: "mock",
    source: "stub",
    async whoami() {
      return { actor };
    },
    async workspaceContext() {
      return workspaceFromSeed(seed, workspaceName, actor);
    },
    async listClients(input: ListClientsInput = {}) {
      const query = input.query?.trim();
      const items = sortByUpdated(seed.clients).filter((item) => {
        if (input.status && item.status !== input.status) return false;
        if (query && !clientMatches(item, query)) return false;
        return true;
      });
      return paginate(items, input.limit);
    },
    async getClient(id: string) {
      return requireClient(id);
    },
    async listProjects(input: ListProjectsInput = {}) {
      if (input.clientId) requireClient(input.clientId);
      const query = input.query?.trim();
      const items = sortByUpdated(seed.projects).filter((project) => {
        if (input.clientId && project.clientId !== input.clientId) return false;
        if (input.status && project.status !== input.status) return false;
        if (query && !matchesAny(query, [project.name, project.phase, project.description])) return false;
        return true;
      });
      return paginate(items, input.limit);
    },
    async getProject(id: string) {
      return requireProject(id);
    },
    async listMilestones(projectId: string) {
      requireProject(projectId);
      const items = seed.milestones
        .filter((milestone) => milestone.projectId === projectId)
        .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || a.name.localeCompare(b.name));
      return paginate(items, 50);
    },
    async listTasks(input: ListTasksInput = {}) {
      if (input.projectId) requireProject(input.projectId);
      const query = input.query?.trim();
      const items = sortByUpdated(seed.tasks).filter((task) => {
        if (input.projectId && task.projectId !== input.projectId) return false;
        if (input.milestoneId && task.milestoneId !== input.milestoneId) return false;
        if (input.assigneeId && task.assigneeId !== input.assigneeId) return false;
        if (input.status && task.status !== input.status) return false;
        if (query && !matchesAny(query, [task.title, task.description])) return false;
        return true;
      });
      return paginate(items, input.limit);
    },
    async getTask(id: string) {
      const task = requireTask(id);
      const comments = seed.comments
        .filter((comment) => comment.taskId === task.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      return { task, comments };
    },
    async deliveryStatus(projectId: string) {
      const project = requireProject(projectId);
      const owner = requireClient(project.clientId);
      return rollupDelivery({
        project,
        client: owner,
        milestones: seed.milestones,
        tasks: seed.tasks,
        today: now.toISOString().slice(0, 10),
      });
    },
    async pipelineSummary() {
      return { available: true, summary: summarizePipeline(seed) };
    },
    async listMembers() {
      const items = [...members.values()].sort((a, b) => a.name.localeCompare(b.name));
      return paginate(items, 50);
    },
    async search(input: SearchInput) {
      return paginate(searchSeed(seed, input.query), input.limit);
    },
    async listShoots(input: ListShootsInput = {}) {
      if (input.clientId) requireClient(input.clientId);
      if (input.projectId) requireProject(input.projectId);
      const query = input.query?.trim();
      const items = [...seed.shoots]
        .filter((shoot) => shootMatches(shoot, input, query))
        .sort(
          (a, b) => a.date.localeCompare(b.date) || a.callTime.localeCompare(b.callTime) || a.title.localeCompare(b.title),
        );
      return paginate(items, input.limit);
    },
    async getShoot(id: string) {
      return requireShoot(id);
    },
    async listReviews(input: ListReviewsInput = {}) {
      if (input.clientId) requireClient(input.clientId);
      if (input.projectId) requireProject(input.projectId);
      const query = input.query?.trim();
      const items = sortByUpdated(seed.reviews).filter((review) => reviewMatches(review, input, query));
      return paginate(items, input.limit);
    },
    async getReview(id: string) {
      return requireReview(id);
    },
  };

  return client;
}

function shootMatches(shoot: Shoot, input: ListShootsInput, query: string | undefined): boolean {
  if (input.clientId && shoot.clientId !== input.clientId) return false;
  if (input.projectId && shoot.projectId !== input.projectId) return false;
  if (input.status && shoot.status !== input.status) return false;
  if (input.from && shoot.date < input.from) return false;
  if (input.to && shoot.date > input.to) return false;
  if (query && !matchesAny(query, [shoot.title, shoot.location, shoot.crewNotes])) return false;
  return true;
}

function reviewMatches(review: Review, input: ListReviewsInput, query: string | undefined): boolean {
  if (input.clientId && review.clientId !== input.clientId) return false;
  if (input.projectId && review.projectId !== input.projectId) return false;
  if (input.status && review.status !== input.status) return false;
  if (query && !matchesAny(query, [review.title, review.frameUrl, review.notes])) return false;
  return true;
}

function clientMatches(client: Client, query: string): boolean {
  return matchesAny(query, [
    client.name,
    client.industry,
    client.notes,
    client.primaryContact?.name,
    client.primaryContact?.email,
  ]);
}

function workspaceFromSeed(seed: StudioSeed, name: string, actor: Actor): WorkspaceContext {
  return {
    workspace: { name, adapter: "stub" },
    actor,
    counts: {
      clients: seed.clients.length,
      projects: seed.projects.length,
      milestones: seed.milestones.length,
      tasks: seed.tasks.length,
      comments: seed.comments.length,
      leads: seed.leads.length,
      proposals: seed.proposals.length,
      members: seed.members.length,
      docs: 0,
      reminders: 0,
      timeEntries: 0,
      links: 0,
    },
    integrations: EMPTY_INTEGRATIONS,
    persistence: "process_memory",
  };
}

function summarizePipeline(seed: StudioSeed): PipelineSummary {
  const byStage = Object.fromEntries(LEAD_STAGES.map((stage) => [stage, 0])) as Record<LeadStage, number>;
  for (const lead of seed.leads) byStage[lead.stage] += 1;

  const byStatus = Object.fromEntries(PROPOSAL_STATUSES.map((status) => [status, 0])) as Record<
    ProposalStatus,
    number
  >;
  const open = new Map<string, number>();
  for (const proposal of seed.proposals) {
    byStatus[proposal.status] += 1;
    if ((proposal.status === "draft" || proposal.status === "sent") && proposal.amount) {
      open.set(proposal.currency, (open.get(proposal.currency) ?? 0) + proposal.amount);
    }
  }

  return {
    leads: { total: seed.leads.length, byStage },
    proposals: {
      total: seed.proposals.length,
      byStatus,
      openAmountByCurrency: [...open.entries()].map(([currency, amount]) => ({ currency, amount })),
    },
  };
}

function searchSeed(seed: StudioSeed, query: string): SearchHit[] {
  const needle = query.trim();
  if (!needle) return [];
  const hits: SearchHit[] = [];

  for (const client of seed.clients) {
    if (!clientMatches(client, needle)) continue;
    hits.push({
      kind: "client",
      id: client.id,
      title: client.name,
      snippet: client.industry ?? client.notes ?? "Client",
      score: includesFold(needle, client.name) ? 3 : 1,
    });
  }

  for (const project of seed.projects) {
    if (!matchesAny(needle, [project.name, project.phase, project.description])) continue;
    const client = seed.clients.find((item) => item.id === project.clientId);
    hits.push({
      kind: "project",
      id: project.id,
      title: project.name,
      snippet: client ? `${client.name} · ${project.phase ?? project.status}` : project.status,
      score: includesFold(needle, project.name) ? 3 : 1,
    });
  }

  for (const task of seed.tasks) {
    if (!matchesAny(needle, [task.title, task.description])) continue;
    const project = seed.projects.find((item) => item.id === task.projectId);
    hits.push({
      kind: "task",
      id: task.id,
      title: task.title,
      snippet: project ? project.name : task.status,
      score: includesFold(needle, task.title) ? 3 : 1,
    });
  }

  for (const member of seed.members) {
    if (!matchesAny(needle, [member.name, member.email, member.role])) continue;
    hits.push({
      kind: "member",
      id: member.id,
      title: member.name,
      snippet: member.role,
      score: includesFold(needle, member.name) ? 2 : 1,
    });
  }

  for (const shoot of seed.shoots) {
    if (!matchesAny(needle, [shoot.title, shoot.location, shoot.crewNotes])) continue;
    const client = seed.clients.find((item) => item.id === shoot.clientId);
    hits.push({
      kind: "shoot",
      id: shoot.id,
      title: shoot.title,
      snippet: client ? `${client.name} · ${shoot.location}` : shoot.location,
      score: includesFold(needle, shoot.title) ? 3 : 1,
    });
  }

  for (const review of seed.reviews) {
    if (!matchesAny(needle, [review.title, review.notes, review.frameUrl])) continue;
    const client = seed.clients.find((item) => item.id === review.clientId);
    hits.push({
      kind: "review",
      id: review.id,
      title: review.title,
      snippet: client ? `${client.name} · ${review.status}` : review.status,
      score: includesFold(needle, review.title) ? 3 : 1,
    });
  }

  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function isClientStatus(value: string | undefined): value is ClientStatus {
  return value === "active" || value === "paused" || value === "prospect" || value === "archived";
}

export function isShootStatus(value: string | undefined): value is ShootStatus {
  return (SHOOT_STATUSES as readonly string[]).includes(value ?? "");
}

export function isReviewStatus(value: string | undefined): value is ReviewStatus {
  return (REVIEW_STATUSES as readonly string[]).includes(value ?? "");
}

export function memberName(members: Member[], id: string | undefined): string | null {
  if (!id) return null;
  return members.find((member) => member.id === id)?.name ?? null;
}
