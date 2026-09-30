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
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
