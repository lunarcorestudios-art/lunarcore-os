import Link from "next/link";

import { ShootStatusBadge } from "@/components/studio/shoot-status-badge";
import { formatDay, formatDayOfMonth, formatWeekday } from "@/lib/format";
import type { ShootRow } from "@/lib/studio/view";
import { cn } from "@/lib/utils";

export function ShootCalendar({
  days,
  rows,
  today,
  selectedId,
  hrefFor,
}: {
  days: readonly string[];
  rows: readonly ShootRow[];
  today: string;
  selectedId?: string;
  hrefFor: (id: string) => string;
}) {
  return (
    <ol
      aria-label="This week"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4 lg:grid-cols-7"
    >
      {days.map((day) => {
        const calls = rows.filter((row) => row.shoot.date === day);
        const isToday = day === today;
        return (
          <li key={day} className={cn("min-h-40 bg-card px-2.5 py-3", isToday && "bg-muted")}>
            <p className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {formatWeekday(day)}
            </p>
            <p className={cn("mt-1 text-xs tabular-nums text-muted-foreground", isToday && "text-foreground")}>
              {formatDayOfMonth(day)}
              {isToday ? " · Today" : ""}
            </p>
            {calls.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No call</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {calls.map((row) => (
                  <li key={row.shoot.id}>
                    <Link
                      href={hrefFor(row.shoot.id)}
                      scroll={false}
                      aria-current={selectedId === row.shoot.id ? "true" : undefined}
                      className={cn(
                        "block rounded-md border border-border bg-background px-2 py-2 hover:border-foreground/40",
                        selectedId === row.shoot.id && "border-foreground",
                      )}
                    >
                      <span className="block text-[0.68rem] tabular-nums text-muted-foreground">
                        {row.shoot.callTime}
                      </span>
                      <span className="mt-1 block truncate text-sm">{row.clientName}</span>
                      <span className="block truncate text-xs text-muted-foreground">{row.shoot.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ShootList({
  rows,
  selectedId,
  hrefFor,
}: {
  rows: readonly ShootRow[];
  selectedId?: string;
  hrefFor: (id: string) => string;
}) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {rows.map((row) => (
        <li key={row.shoot.id}>
          <Link
            href={hrefFor(row.shoot.id)}
            scroll={false}
            aria-current={selectedId === row.shoot.id ? "true" : undefined}
            className={cn(
              "grid gap-2 px-4 py-4 hover:bg-muted/60 sm:grid-cols-[7.5rem_4.25rem_minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4",
              selectedId === row.shoot.id && "bg-muted/80",
            )}
          >
            <span className="text-sm tabular-nums">{formatDay(row.shoot.date)}</span>
            <span className="text-sm tabular-nums text-muted-foreground">{row.shoot.callTime}</span>
            <span className="min-w-0">
              <span className="block truncate font-display text-2xl leading-tight tracking-tight">{row.clientName}</span>
              <span className="mt-1 block truncate text-sm text-muted-foreground">
                {row.shoot.title} · {row.projectName}
              </span>
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {row.shoot.location}
              <span className="sm:hidden">
                {" "}
                · {row.shoot.crewCount} crew
              </span>
            </span>
            <span className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="hidden text-sm text-muted-foreground sm:inline">{row.shoot.crewCount} crew</span>
              <ShootStatusBadge status={row.shoot.status} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
