import { todayUtc } from "@/lib/format";
import type {
  Client,
  DeliveryStatus,
  Milestone,
  MilestoneStatus,
  Project,
  Task,
  TaskStatus,
} from "@/lib/studio/types";
import { MILESTONE_STATUSES, TASK_STATUSES } from "@/lib/studio/types";

function countBy<T extends string>(values: T[], keys: readonly T[]): Record<T, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
  for (const value of values) counts[value] += 1;
  return counts;
}

/**
 * Same health rule as lunarcore-mcp `MemoryStudio.deliveryStatus`:
 * delivered projects stay delivered; otherwise blocked tasks or milestones
 * win, then an open milestone past its due date is at risk, else on track.
 */
export function rollupDelivery(input: {
  project: Project;
  client: Client;
  milestones: Milestone[];
  tasks: Task[];
  today?: string;
}): DeliveryStatus {
  const today = input.today ?? todayUtc();
  const milestones = input.milestones.filter((milestone) => milestone.projectId === input.project.id);
  const tasks = input.tasks.filter((task) => task.projectId === input.project.id);
  const openMilestones = milestones
    .filter((milestone) => milestone.status !== "done")
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || a.name.localeCompare(b.name));
  const blockedTasks = tasks.filter((task) => task.status === "blocked");
  const overdue = milestones.some(
    (milestone) => milestone.status !== "done" && milestone.dueDate !== undefined && milestone.dueDate < today,
  );

  let health: DeliveryStatus["health"] = "on_track";
  if (input.project.status === "delivered") health = "delivered";
  else if (blockedTasks.length > 0 || milestones.some((milestone) => milestone.status === "blocked")) {
    health = "blocked";
  } else if (overdue) health = "at_risk";

  const next = openMilestones[0];
  return {
    project: input.project,
    client: input.client,
    milestones: {
      total: milestones.length,
      byStatus: countBy(
        milestones.map((milestone) => milestone.status),
        MILESTONE_STATUSES,
      ) as Record<MilestoneStatus, number>,
      ...(next ? { next } : {}),
    },
    tasks: {
      total: tasks.length,
      byStatus: countBy(
        tasks.map((task) => task.status),
        TASK_STATUSES,
      ) as Record<TaskStatus, number>,
      blocked: blockedTasks.map((task) => ({ id: task.id, title: task.title })),
    },
    health,
  };
}
