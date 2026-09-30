import { SHOOT_STATUS_LABEL } from "@/lib/studio/labels";
import type { ShootStatus } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

const tone: Record<ShootStatus, string> = {
  confirmed: "border-success/40 bg-success/12 text-success",
  hold: "border-warning/40 bg-warning/12 text-warning",
  wrapped: "border-info/40 bg-info/12 text-info",
  cancelled: "border-border bg-muted text-muted-foreground",
};

export function ShootStatusBadge({ status, className }: { status: ShootStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-medium tracking-wide uppercase",
        tone[status],
        className,
      )}
    >
      {SHOOT_STATUS_LABEL[status]}
    </span>
  );
}
