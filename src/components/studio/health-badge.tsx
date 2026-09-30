import { HEALTH_LABEL } from "@/lib/studio/labels";
import type { DeliveryHealth } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

const tone: Record<DeliveryHealth, string> = {
  blocked: "bg-danger/12 text-danger",
  at_risk: "bg-warning/12 text-warning",
  on_track: "bg-success/12 text-success",
  delivered: "bg-info/12 text-info",
};

export function HealthBadge({ health, className }: { health: DeliveryHealth; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone[health],
        className,
      )}
    >
      {HEALTH_LABEL[health]}
    </span>
  );
}
