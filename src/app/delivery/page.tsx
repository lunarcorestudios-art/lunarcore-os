import Link from "next/link";

import { DeliveryCard } from "@/components/studio/delivery-card";
import { EmptyState } from "@/components/studio/empty-state";
import { PageHeader } from "@/components/studio/page-header";
import { HEALTH_LABEL } from "@/lib/studio/labels";
import { DELIVERY_HEALTH, type DeliveryHealth } from "@/lib/studio/types";
import { loadDeliveryIndex } from "@/lib/studio/view";
import { cn } from "@/lib/utils";

export const metadata = { title: "Delivery" };

const FILTERS: Array<{ health?: DeliveryHealth; label: string }> = [
  { label: "All" },
  ...DELIVERY_HEALTH.map((health) => ({ health, label: HEALTH_LABEL[health] })),
];

export default async function DeliveryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const health = first(params.health);
  const index = await loadDeliveryIndex(health);
  const groups = DELIVERY_HEALTH.map((item) => ({
    health: item,
    items: index.deliveries.filter((delivery) => delivery.health === item),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <PageHeader
        kicker="Delivery status"
        title="The floor"
        lede="Health rolls up the way lunarcore-mcp does: blocked work first, then an open milestone past its date."
      />
      <nav aria-label="Delivery health" className="mb-8 flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => {
          const active = filter.health === index.health;
          const href = filter.health ? `/delivery?health=${filter.health}` : "/delivery";
          return (
            <Link
              key={filter.label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs tracking-wide",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>
      {groups.length === 0 ? (
        <EmptyState title="Nothing in this health." body="Clear the filter to see the rest of the floor." />
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.health}>
              <h2 className="mb-3 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                {HEALTH_LABEL[group.health]} · {group.items.length}
              </h2>
              <div className="space-y-4">
                {group.items.map((delivery) => (
                  <DeliveryCard key={delivery.project.id} delivery={delivery} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
