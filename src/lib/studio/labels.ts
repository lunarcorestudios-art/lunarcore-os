import type {
  ClientStatus,
  DeliveryHealth,
  MilestoneStatus,
  ProjectStatus,
  ReviewStatus,
  ShootStatus,
  ShootWindow,
  TaskPriority,
  TaskStatus,
} from "@/lib/studio/types";

export const HEALTH_LABEL: Record<DeliveryHealth, string> = {
  on_track: "On track",
  at_risk: "At risk",
  blocked: "Blocked",
  delivered: "Delivered",
};

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  active: "Active",
  paused: "Paused",
  prospect: "Prospect",
  archived: "Archived",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  review: "Review",
  delivered: "Delivered",
  on_hold: "On hold",
  archived: "Archived",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  blocked: "Blocked",
  in_progress: "In progress",
  todo: "To do",
  done: "Done",
};

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
};

export const SHOOT_STATUS_LABEL: Record<ShootStatus, string> = {
  confirmed: "Confirmed",
  hold: "Hold",
  wrapped: "Wrapped",
  cancelled: "Cancelled",
};

export const SHOOT_WINDOW_LABEL: Record<ShootWindow, string> = {
  this_week: "This week",
  upcoming: "Upcoming",
  past: "Past",
};

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  in_review: "In review",
  approved: "Approved",
  changes_requested: "Changes requested",
  waiting: "Waiting",
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const LEAD_STAGE_LABEL = {
  new: "New",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
} as const;

export function sourceCaption(transport: "mock" | "http", source: string): string {
  if (transport === "mock") return "Memory seed";
  if (source === "clickup") return "Studio bridge · ClickUp";
  if (source === "stub") return "Studio bridge · memory";
  if (source === "google") return "Studio bridge · Google";
  return "Studio bridge";
}
