import type { DeliveryHealth } from "@/lib/studio/types";

export function todayUtc(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function addDays(day: string, offset: number): string {
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) return day;
  return new Date(Date.UTC(year, month - 1, date + offset)).toISOString().slice(0, 10);
}

export function formatDay(day: string | undefined): string {
  if (!day) return "No date";
  const parsed = parseUtcDay(day);
  if (!parsed) return day;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function formatWeekday(day: string): string {
  const parsed = parseUtcDay(day);
  if (!parsed) return day;
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(parsed);
}

export function formatDayOfMonth(day: string): string {
  const parsed = parseUtcDay(day);
  if (!parsed) return day;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(parsed);
}

/** Philippine wall-clock label. `time` is `HH:mm` already, not an instant. */
export function formatCallTime(time: string | undefined): string {
  if (!time) return "Call time not set";
  return `${time} PHT`;
}

function parseUtcDay(day: string): Date | null {
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) return null;
  return new Date(Date.UTC(year, month - 1, date));
}

export function duePhrase(day: string | undefined, today = todayUtc()): string | null {
  if (!day) return null;
  const diff = Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff > 1) return `Due in ${diff} days`;
  if (diff === -1) return "1 day overdue";
  return `${Math.abs(diff)} days overdue`;
}

export function isOverdue(day: string | undefined, today = todayUtc()): boolean {
  return day !== undefined && day < today;
}

const HEALTH_RANK: Record<DeliveryHealth, number> = {
  blocked: 0,
  at_risk: 1,
  on_track: 2,
  delivered: 3,
};

export function worstHealth(healths: DeliveryHealth[]): DeliveryHealth | null {
  if (healths.length === 0) return null;
  return [...healths].sort((a, b) => HEALTH_RANK[a] - HEALTH_RANK[b])[0] ?? null;
}

export function compareHealth(a: DeliveryHealth, b: DeliveryHealth): number {
  return HEALTH_RANK[a] - HEALTH_RANK[b];
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Accept only https links so a bridge cannot inject a script URL into the review board. */
export function externalHttpsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
