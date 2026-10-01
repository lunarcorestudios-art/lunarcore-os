import { TASK_STATUS_LABEL } from "@/lib/studio/labels";
import type { TaskStatus } from "@/lib/studio/types";

const segments: Array<{ status: TaskStatus; className: string }> = [
  { status: "done", className: "bg-success" },
  { status: "in_progress", className: "bg-accent" },
  { status: "todo", className: "bg-foreground/20" },
  { status: "blocked", className: "bg-danger" },
];

export function TaskMeter({ byStatus, total }: { byStatus: Record<TaskStatus, number>; total: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">Tasks</p>
        <p className="text-sm tabular-nums text-muted-foreground">{total}</p>
      </div>
      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        {total === 0
          ? null
          : segments.map((segment) =>
              byStatus[segment.status] > 0 ? (
                <span
                  key={segment.status}
                  className={segment.className}
                  style={{ width: `${(byStatus[segment.status] / total) * 100}%` }}
                />
              ) : null,
            )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {segments.map((segment) => (
          <li key={segment.status} className="tabular-nums">
            <span className="text-foreground">{byStatus[segment.status]}</span> {TASK_STATUS_LABEL[segment.status]}
          </li>
        ))}
      </ul>
    </div>
  );
}
