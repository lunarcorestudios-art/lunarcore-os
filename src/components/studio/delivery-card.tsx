import Link from "next/link";

import { HealthBadge } from "@/components/studio/health-badge";
import { TaskMeter } from "@/components/studio/task-meter";
import { duePhrase, formatDay, isOverdue } from "@/lib/format";
import { MILESTONE_STATUS_LABEL, PROJECT_STATUS_LABEL } from "@/lib/studio/labels";
import type { DeliveryStatus } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

export function DeliveryCard({
  delivery,
  compact = false,
}: {
  delivery: DeliveryStatus;
  compact?: boolean;
}) {
  const { project, client, milestones, tasks, health } = delivery;
  const next = milestones.next;
  const nextDue = duePhrase(next?.dueDate);
  const projectDue = duePhrase(project.dueDate);

  return (
    <article className="rounded-lg border border-border bg-card shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            <Link href={`/clients/${client.id}`} className="transition-colors hover:text-accent">
              {client.name}
            </Link>
          </p>
          <h2 className="mt-1 font-display text-xl leading-tight font-semibold tracking-tight">
            <Link href={`/delivery/${project.id}`} className="transition-colors hover:text-accent">
              {project.name}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {[project.phase, PROJECT_STATUS_LABEL[project.status], projectDue].filter(Boolean).join(" · ")}
          </p>
        </div>
        <HealthBadge health={health} />
      </div>

      {tasks.blocked.length > 0 ? (
        <div className="mx-5 mb-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3">
          <p className="text-xs font-medium text-danger">Blocked work</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {tasks.blocked.map((task) => (
              <li key={task.id}>
                <Link href={`/delivery/${project.id}#${task.id}`} className="hover:underline">
                  {task.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {compact ? null : (
        <div className="grid gap-5 border-t border-border px-5 py-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Next milestone</p>
            {next ? (
              <>
                <p className="mt-1 text-sm">{next.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {MILESTONE_STATUS_LABEL[next.status]}
                  {next.dueDate ? ` · ${formatDay(next.dueDate)}` : ""}
                </p>
                {nextDue ? (
                  <p className={cn("mt-1 text-sm", isOverdue(next.dueDate) ? "text-warning" : "text-muted-foreground")}>
                    {nextDue}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No open milestone.</p>
            )}
          </div>
          <TaskMeter byStatus={tasks.byStatus} total={tasks.total} />
        </div>
      )}
    </article>
  );
}
