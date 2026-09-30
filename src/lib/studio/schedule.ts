import { addDays, todayUtc } from "@/lib/format";
import { SHOOT_WINDOWS, type ShootWindow } from "@/lib/studio/types";

export function isShootWindow(value: string | undefined): value is ShootWindow {
  return (SHOOT_WINDOWS as readonly string[]).includes(value ?? "");
}

/** Inclusive `from` / `to` for a schedule window, in UTC calendar days. */
export function rangeForShootWindow(
  window: ShootWindow,
  today = todayUtc(),
): { from?: string; to?: string } {
  if (window === "upcoming") return { from: today };
  if (window === "past") return { to: addDays(today, -1) };
  const monday = startOfWeekMonday(today);
  return { from: monday, to: addDays(monday, 6) };
}

export function weekDates(today = todayUtc()): string[] {
  const monday = startOfWeekMonday(today);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

/** Prefer the current week when a day sits in both "past" and "this week". */
export function shootWindowForDate(date: string, today = todayUtc()): ShootWindow {
  const week = rangeForShootWindow("this_week", today);
  if (week.from && week.to && date >= week.from && date <= week.to) return "this_week";
  if (date < today) return "past";
  return "upcoming";
}

export function startOfWeekMonday(day: string): string {
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) return day;
  const dow = new Date(Date.UTC(year, month - 1, date)).getUTCDay();
  const fromMonday = dow === 0 ? 6 : dow - 1;
  return addDays(day, -fromMonday);
}
