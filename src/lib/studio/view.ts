import "server-only";

import { compareHealth, todayUtc, worstHealth } from "@/lib/format";
import { getStudioClient } from "@/lib/studio/client";
import { StudioNotFound } from "@/lib/studio/errors";
import { isClientStatus, isReviewStatus } from "@/lib/studio/mock";
import { isShootWindow, rangeForShootWindow, weekDates } from "@/lib/studio/schedule";
import {
  REVIEW_STATUSES,
  type Actor,
  type Client,
  type ClientStatus,
  type DeliveryHealth,
  type DeliveryStatus,
  type Member,
  type Milestone,
  type PipelineView,
  type Project,
  type Review,
  type ReviewStatus,
  type Shoot,
  type ShootWindow,
  type TaskRecord,
  type WorkspaceContext,
} from "@/lib/studio/types";

export interface ShellModel {
  actor: Actor;
  workspaceName: string;
  caption: string;
}

export interface ClientRow {
  client: Client;
  projectCount: number;
  health: DeliveryHealth | null;
}

export interface DashboardModel {
  workspace: WorkspaceContext;
  headline: string;
  lede: string;
  attention: DeliveryStatus[];
  onTrack: number;
  delivered: number;
  recentClients: ClientRow[];
  pipeline: PipelineView;
}

export interface DirectoryModel {
  rows: ClientRow[];
  total: number;
  status?: ClientStatus;
  query: string;
}

export interface ClientDetailModel {
  client: Client;
  deliveries: DeliveryStatus[];
  members: Member[];
}

export interface DeliveryIndexModel {
  deliveries: DeliveryStatus[];
  health?: DeliveryHealth;
  members: Member[];
}

export interface DeliveryDetailModel {
  delivery: DeliveryStatus;
  milestones: Milestone[];
  tasks: Array<TaskRecord & { assigneeName: string | null }>;
  commentsByAuthor: Map<string, string>;
  members: Member[];
}

export type ScheduleView = "week" | "list";

export interface ShootRow {
  shoot: Shoot;
  clientName: string;
  projectName: string;
  leadName: string | null;
}

export interface ShootBoardModel {
  window: ShootWindow;
  view: ScheduleView;
  clientId?: string;
  clients: Client[];
  rows: ShootRow[];
  week: string[];
  today: string;
  totalInStudio: number;
  selected: ShootRow | null;
  missingShoot: boolean;
}

export interface ReviewRow {
  review: Review;
  clientName: string;
  projectName: string;
}

export interface ReviewBoardModel {
  status?: ReviewStatus;
  clientId?: string;
  clients: Client[];
  rows: ReviewRow[];
  counts: Record<ReviewStatus, number>;
  totalInStudio: number;
}

export async function loadShell(): Promise<ShellModel> {
  const studio = await getStudioClient();
  const [{ actor }, workspace] = await Promise.all([studio.whoami(), studio.workspaceContext()]);
  const caption = studio.transport === "mock" ? "Memory seed" : `Bridge · ${workspace.workspace.adapter}`;
  return { actor, workspaceName: workspace.workspace.name, caption };
}

export async function loadDashboard(): Promise<DashboardModel> {
  const studio = await getStudioClient();
  const [workspace, clients, projects, pipeline] = await Promise.all([
    studio.workspaceContext(),
    studio.listClients({ limit: 200 }),
    studio.listProjects({ limit: 200 }),
    studio.pipelineSummary(),
  ]);
  const deliveries = await Promise.all(projects.items.map((project) => studio.deliveryStatus(project.id)));
  const attention = deliveries
    .filter((delivery) => delivery.health === "blocked" || delivery.health === "at_risk")
    .sort((a, b) => compareHealth(a.health, b.health) || a.project.name.localeCompare(b.project.name));
  const blocked = attention.filter((delivery) => delivery.health === "blocked").length;
  const atRisk = attention.filter((delivery) => delivery.health === "at_risk").length;
  const copy = floorCopy(blocked, atRisk);

  return {
    workspace,
    headline: copy.headline,
    lede: copy.lede,
    attention,
    onTrack: deliveries.filter((delivery) => delivery.health === "on_track").length,
    delivered: deliveries.filter((delivery) => delivery.health === "delivered").length,
    recentClients: clientRows(clients.items, deliveries).slice(0, 5),
    pipeline,
  };
}

export async function loadDirectory(input: {
  status?: string;
  query?: string;
}): Promise<DirectoryModel> {
  const studio = await getStudioClient();
  const status = isClientStatus(input.status) ? input.status : undefined;
  const query = input.query?.trim() ?? "";
  const [clients, projects] = await Promise.all([
    studio.listClients({ status, query: query || undefined, limit: 200 }),
    studio.listProjects({ limit: 200 }),
  ]);
  const deliveries = await Promise.all(projects.items.map((project) => studio.deliveryStatus(project.id)));
  const rows = clientRows(clients.items, deliveries).sort((a, b) => {
    if (a.health && b.health) return compareHealth(a.health, b.health) || a.client.name.localeCompare(b.client.name);
    if (a.health) return -1;
    if (b.health) return 1;
    return a.client.name.localeCompare(b.client.name);
  });
  return { rows, total: clients.total, status, query };
}

export async function loadClientDetail(id: string): Promise<ClientDetailModel> {
  const studio = await getStudioClient();
  const [client, projects, members] = await Promise.all([
    studio.getClient(id),
    studio.listProjects({ clientId: id, limit: 200 }),
    studio.listMembers(),
  ]);
  const deliveries = await Promise.all(projects.items.map((project) => studio.deliveryStatus(project.id)));
  deliveries.sort((a, b) => compareHealth(a.health, b.health) || a.project.name.localeCompare(b.project.name));
  return { client, deliveries, members: members.items };
}

export async function loadDeliveryIndex(health?: string): Promise<DeliveryIndexModel> {
  const studio = await getStudioClient();
  const [projects, members] = await Promise.all([studio.listProjects({ limit: 200 }), studio.listMembers()]);
  const deliveries = await Promise.all(projects.items.map((project) => studio.deliveryStatus(project.id)));
  deliveries.sort((a, b) => compareHealth(a.health, b.health) || a.client.name.localeCompare(b.client.name));
  const filter = isHealth(health) ? health : undefined;
  return {
    deliveries: filter ? deliveries.filter((delivery) => delivery.health === filter) : deliveries,
    health: filter,
    members: members.items,
  };
}

export async function loadDeliveryDetail(id: string): Promise<DeliveryDetailModel> {
  const studio = await getStudioClient();
  const [delivery, milestones, tasks, members] = await Promise.all([
    studio.deliveryStatus(id),
    studio.listMilestones(id),
    studio.listTasks({ projectId: id, limit: 200 }),
    studio.listMembers(),
  ]);
  const detailed = await Promise.all(tasks.items.map((task) => studio.getTask(task.id)));
  const order: Record<string, number> = { blocked: 0, in_progress: 1, todo: 2, done: 3 };
  detailed.sort(
    (a, b) => (order[a.task.status] ?? 9) - (order[b.task.status] ?? 9) || a.task.title.localeCompare(b.task.title),
  );
  const names = new Map(members.items.map((member) => [member.id, member.name]));
  return {
    delivery,
    milestones: milestones.items,
    tasks: detailed.map((record) => ({
      ...record,
      assigneeName: record.task.assigneeId ? (names.get(record.task.assigneeId) ?? null) : null,
    })),
    commentsByAuthor: names,
    members: members.items,
  };
}

export async function loadShootBoard(input: {
  window?: string;
  clientId?: string;
  view?: string;
  shootId?: string;
}): Promise<ShootBoardModel> {
  const studio = await getStudioClient();
  const today = todayUtc();
  const window = isShootWindow(input.window) ? input.window : "this_week";
  const view = resolveScheduleView(input.view, window);
  const range = rangeForShootWindow(window, today);
  const clients = await studio.listClients({ limit: 200 });
  const requested = input.clientId?.trim() || undefined;
  const clientId = requested && clients.items.some((client) => client.id === requested) ? requested : undefined;

  const [everyone, page, projects, members] = await Promise.all([
    studio.listShoots({ limit: 200 }),
    studio.listShoots({ ...range, clientId, limit: 200 }),
    studio.listProjects({ limit: 200 }),
    studio.listMembers(),
  ]);

  const rows = page.items.map((shoot) => toShootRow(shoot, clients.items, projects.items, members.items));
  if (window === "past") {
    rows.sort((a, b) => b.shoot.date.localeCompare(a.shoot.date) || b.shoot.callTime.localeCompare(a.shoot.callTime));
  }

  const clientIds = new Set(everyone.items.map((shoot) => shoot.clientId));
  let selected: ShootRow | null = null;
  let missingShoot = false;
  if (input.shootId) {
    try {
      const shoot = await studio.getShoot(input.shootId);
      selected = toShootRow(shoot, clients.items, projects.items, members.items);
    } catch (error) {
      if (!(error instanceof StudioNotFound)) throw error;
      missingShoot = true;
    }
  }

  return {
    window,
    view,
    clientId,
    clients: clients.items
      .filter((client) => clientIds.has(client.id))
      .sort((a, b) => a.name.localeCompare(b.name)),
    rows,
    week: weekDates(today),
    today,
    totalInStudio: everyone.total,
    selected,
    missingShoot,
  };
}

export async function loadReviewBoard(input: { status?: string; clientId?: string }): Promise<ReviewBoardModel> {
  const studio = await getStudioClient();
  const status = isReviewStatus(input.status) ? input.status : undefined;
  const clients = await studio.listClients({ limit: 200 });
  const requested = input.clientId?.trim() || undefined;
  const clientId = requested && clients.items.some((client) => client.id === requested) ? requested : undefined;

  const [everyone, page, projects] = await Promise.all([
    studio.listReviews({ limit: 200 }),
    studio.listReviews({ clientId, status, limit: 200 }),
    studio.listProjects({ limit: 200 }),
  ]);
  const scoped = clientId ? everyone.items.filter((review) => review.clientId === clientId) : everyone.items;
  const counts = Object.fromEntries(REVIEW_STATUSES.map((item) => [item, 0])) as Record<ReviewStatus, number>;
  for (const review of scoped) counts[review.status] += 1;
  const clientIds = new Set(everyone.items.map((review) => review.clientId));

  return {
    status,
    clientId,
    clients: clients.items
      .filter((client) => clientIds.has(client.id))
      .sort((a, b) => a.name.localeCompare(b.name)),
    rows: page.items.map((review) => toReviewRow(review, clients.items, projects.items)),
    counts,
    totalInStudio: everyone.total,
  };
}

function toShootRow(shoot: Shoot, clients: Client[], projects: Project[], members: Member[]): ShootRow {
  return {
    shoot,
    clientName: clients.find((client) => client.id === shoot.clientId)?.name ?? "Unknown client",
    projectName: projects.find((project) => project.id === shoot.projectId)?.name ?? "Unknown project",
    leadName: members.find((member) => member.id === shoot.crewLeadId)?.name ?? null,
  };
}

function toReviewRow(review: Review, clients: Client[], projects: Project[]): ReviewRow {
  return {
    review,
    clientName: clients.find((client) => client.id === review.clientId)?.name ?? "Unknown client",
    projectName: projects.find((project) => project.id === review.projectId)?.name ?? "Unknown project",
  };
}

function resolveScheduleView(view: string | undefined, window: ShootWindow): ScheduleView {
  if (view === "week" || view === "list") return view;
  return window === "this_week" ? "week" : "list";
}

function clientRows(clients: Client[], deliveries: DeliveryStatus[]): ClientRow[] {
  return [...clients]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((client) => {
      const own = deliveries.filter((delivery) => delivery.client.id === client.id);
      return {
        client,
        projectCount: own.length,
        health: worstHealth(own.map((delivery) => delivery.health)),
      };
    });
}

function floorCopy(blocked: number, atRisk: number): { headline: string; lede: string } {
  if (blocked === 0 && atRisk === 0) {
    return {
      headline: "The floor is clear.",
      lede: "No project is blocked, and no open milestone is past due.",
    };
  }
  if (blocked > 0) {
    const risk = atRisk > 0 ? ` ${atRisk} ${atRisk === 1 ? "is" : "are"} at risk.` : "";
    return {
      headline: "Delivery needs a producer.",
      lede: `${blocked} ${blocked === 1 ? "project is" : "projects are"} blocked.${risk}`,
    };
  }
  return {
    headline: "A few dates have slipped.",
    lede: `${atRisk} ${atRisk === 1 ? "project has" : "projects have"} an open milestone past its due date.`,
  };
}

function isHealth(value: string | undefined): value is DeliveryHealth {
  return value === "on_track" || value === "at_risk" || value === "blocked" || value === "delivered";
}

