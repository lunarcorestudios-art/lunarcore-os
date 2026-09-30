import { HEALTH_LABEL } from "@/lib/studio/labels";
import type { DeliveryHealth } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

const tone: Record<DeliveryHealth, string> = {
  blocked: "border-danger/40 bg-danger/12 text-danger",
  at_risk: "border-warning/40 bg-warning/12 text-warning",
  on_track: "border-success/40 bg-success/12 text-success",
  delivered: "border-info/40 bg-info/12 text-info",
};

export function HealthBadge({ health, className }: { health: DeliveryHealth; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-medium tracking-wide uppercase",
        tone[health],
        className,
      )}
    >
      {HEALTH_LABEL[health]}
    </span>
  );
}
