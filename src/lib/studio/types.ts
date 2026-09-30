/**
 * Studio shapes mirrored from lunarcore-mcp (`src/types/entities.ts` and
 * `src/types/results.ts`). The web app reads them. It does not own writes.
 */

export const DATA_SOURCES = ["stub", "clickup", "google"] as const;
export type DataSource = (typeof DATA_SOURCES)[number];

export const CLIENT_STATUSES = ["active", "paused", "prospect", "archived"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const PROJECT_STATUSES = [
  "planning",
  "active",
  "review",
  "delivered",
  "on_hold",
  "archived",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const MILESTONE_STATUSES = ["pending", "in_progress", "done", "blocked"] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const TASK_STATUSES = ["todo", "in_progress", "blocked", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const LEAD_STAGES = ["new", "qualified", "proposal", "won", "lost"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const PROPOSAL_STATUSES = ["draft", "sent", "accepted", "declined"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const DELIVERY_HEALTH = ["on_track", "at_risk", "blocked", "delivered"] as const;
export type DeliveryHealth = (typeof DELIVERY_HEALTH)[number];

export interface Contact {
  name?: string;
  email?: string;
}

export interface Client {
  id: string;
  name: string;
  status: ClientStatus;
  industry?: string;
  primaryContact?: Contact;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  status: ProjectStatus;
  phase?: string;
  startDate?: string;
  dueDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  status: MilestoneStatus;
  dueDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId?: string;
  body: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  source?: string;
  stage: LeadStage;
  ownerId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  leadId?: string;
  clientId?: string;
  title: string;
  status: ProposalStatus;
  amount?: number;
  currency: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export interface Page<T> {
  items: T[];
  total: number;
}

export interface Actor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface IntegrationPresence {
  clickup: {
    configured: boolean;
    present: { apiToken: boolean; teamId: boolean };
  };
  google: {
    configured: boolean;
    present: { clientId: boolean; clientSecret: boolean; refreshToken: boolean };
  };
}

export interface WorkspaceContext {
  workspace: { name: string; adapter: DataSource };
  actor: Actor;
  counts: {
    clients: number;
    projects: number;
    milestones: number;
    tasks: number;
    comments: number;
    leads: number;
    proposals: number;
    members: number;
    docs: number;
    reminders: number;
    timeEntries: number;
    links: number;
  };
  integrations: IntegrationPresence;
  persistence: "process_memory" | "external";
}

export interface DeliveryStatus {
  project: Project;
  client: Client;
  milestones: {
    total: number;
    byStatus: Record<MilestoneStatus, number>;
    next?: Milestone;
  };
  tasks: {
    total: number;
    byStatus: Record<TaskStatus, number>;
    blocked: Array<{ id: string; title: string }>;
  };
  health: DeliveryHealth;
}

export interface PipelineSummary {
  leads: { total: number; byStage: Record<LeadStage, number> };
  proposals: {
    total: number;
    byStatus: Record<ProposalStatus, number>;
    openAmountByCurrency: Array<{ currency: string; amount: number }>;
  };
}

export interface SearchHit {
  kind: string;
  id: string;
  title: string;
  snippet: string;
  score: number;
}

export interface ActorRecord {
  actor: Actor;
}

export interface TaskRecord {
  task: Task;
  comments: TaskComment[];
}

export type PipelineView =
  | { available: true; summary: PipelineSummary }
  | { available: false; reason: string };

export interface ListClientsInput {
  status?: ClientStatus;
  query?: string;
  limit?: number;
}

export interface ListProjectsInput {
  clientId?: string;
  status?: ProjectStatus;
  query?: string;
  limit?: number;
}

export interface ListTasksInput {
  projectId?: string;
  milestoneId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  query?: string;
  limit?: number;
}

export interface SearchInput {
  query: string;
  limit?: number;
}

/**
 * Read port for the console. Method payloads match lunarcore-mcp tool data.
 * Writes stay on the MCP server.
 */
export interface StudioClient {
  readonly transport: "mock" | "http";
  readonly source: DataSource;
  whoami(): Promise<ActorRecord>;
  workspaceContext(): Promise<WorkspaceContext>;
  listClients(input?: ListClientsInput): Promise<Page<Client>>;
  getClient(id: string): Promise<Client>;
  listProjects(input?: ListProjectsInput): Promise<Page<Project>>;
  getProject(id: string): Promise<Project>;
  listMilestones(projectId: string): Promise<Page<Milestone>>;
  listTasks(input?: ListTasksInput): Promise<Page<Task>>;
  getTask(id: string): Promise<TaskRecord>;
  deliveryStatus(projectId: string): Promise<DeliveryStatus>;
  pipelineSummary(): Promise<PipelineView>;
  listMembers(): Promise<Page<Member>>;
  search(input: SearchInput): Promise<Page<SearchHit>>;
}
