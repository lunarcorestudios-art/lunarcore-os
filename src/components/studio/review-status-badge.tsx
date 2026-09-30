import { REVIEW_STATUS_LABEL } from "@/lib/studio/labels";
import type { ReviewStatus } from "@/lib/studio/types";
import { cn } from "@/lib/utils";

const tone: Record<ReviewStatus, string> = {
  in_review: "border-info/40 bg-info/12 text-info",
  approved: "border-success/40 bg-success/12 text-success",
  changes_requested: "border-warning/40 bg-warning/12 text-warning",
  waiting: "border-border bg-muted text-muted-foreground",
};

export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[0.7rem] font-medium tracking-wide uppercase",
        tone[status],
        className,
      )}
    >
      {REVIEW_STATUS_LABEL[status]}
    </span>
  );
}
