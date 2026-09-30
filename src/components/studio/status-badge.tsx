import { CLIENT_STATUS_LABEL, PROJECT_STATUS_LABEL } from "@/lib/studio/labels";
import type { ClientStatus, ProjectStatus } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  kind,
}: {
  status: ClientStatus | ProjectStatus;
  kind: "client" | "project";
}) {
  const label = kind === "client" ? CLIENT_STATUS_LABEL[status as ClientStatus] : PROJECT_STATUS_LABEL[status as ProjectStatus];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase",
      )}
    >
      {label}
    </span>
  );
}
