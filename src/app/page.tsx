import Link from "next/link";

import { DeliveryCard } from "@/components/studio/delivery-card";
import { EmptyState } from "@/components/studio/empty-state";
import { HealthBadge } from "@/components/studio/health-badge";
import { PageHeader } from "@/components/studio/page-header";
import { formatMoney } from "@/lib/format";
import { LEAD_STAGE_LABEL } from "@/lib/studio/labels";
import { LEAD_STAGES } from "@/lib/studio/types";
import { loadDashboard } from "@/lib/studio/view";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const dashboard = await loadDashboard();
  const { workspace } = dashboard;

  return (
    <>
      <PageHeader
        kicker={workspace.workspace.name}
        title={dashboard.headline}
        lede={dashboard.lede}
        actions={
          <Link
            href="/delivery"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Open delivery
          </Link>
        }
      />

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        <Metric label="Clients" value={workspace.counts.clients} hint="Client Work folders" />
        <Metric label="Projects" value={workspace.counts.projects} hint="Lists under those clients" />
        <Metric label="Blocked" value={dashboard.attention.filter((item) => item.health === "blocked").length} hint="Needs a producer" />
        <Metric label="At risk" value={dashboard.attention.filter((item) => item.health === "at_risk").length} hint="Milestone past due" />
      </dl>
      <p className="mt-3 text-sm text-muted-foreground">
        {dashboard.onTrack} on track · {dashboard.delivered} delivered
      </p>

      <section className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.8fr)]">
        <div>
          <SectionLabel>Needs attention</SectionLabel>
          {dashboard.attention.length === 0 ? (
            <EmptyState
              title="Nothing is waiting."
              body={`${dashboard.onTrack} projects are on track. ${dashboard.delivered} already delivered.`}
            />
          ) : (
            <div className="space-y-4">
              {dashboard.attention.map((delivery) => (
                <DeliveryCard key={delivery.project.id} delivery={delivery} />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-8">
          <section>
            <SectionLabel>Recent clients</SectionLabel>
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {dashboard.recentClients.map((row) => (
                <li key={row.client.id}>
                  <Link href={`/clients/${row.client.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/70">
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{row.client.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {row.client.industry ?? "Client"} · {row.projectCount}{" "}
                        {row.projectCount === 1 ? "project" : "projects"}
                      </span>
                    </span>
                    {row.health ? <HealthBadge health={row.health} /> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <PipelinePanel pipeline={dashboard.pipeline} />
        </div>
      </section>
    </>
  );
}

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="bg-card px-4 py-4 sm:px-5">
      <dt className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-2 font-display text-4xl tabular-nums tracking-tight">{value}</dd>
      <dd className="mt-1 text-xs text-muted-foreground">{hint}</dd>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">{children}</h2>
  );
}

function PipelinePanel({ pipeline }: { pipeline: Awaited<ReturnType<typeof loadDashboard>>["pipeline"] }) {
  return (
    <section className="rounded-lg border border-border bg-card px-4 py-4">
      <h2 className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">Pipeline</h2>
      {pipeline.available ? (
        <div className="mt-3 space-y-4">
          <p className="font-display text-3xl tabular-nums tracking-tight">{pipeline.summary.leads.total}</p>
          <p className="-mt-2 text-xs text-muted-foreground">
            {pipeline.summary.leads.total === 1 ? "Lead" : "Leads"}
          </p>
          <ul className="space-y-1 text-sm">
            {LEAD_STAGES.filter((stage) => pipeline.summary.leads.byStage[stage] > 0).map((stage) => (
              <li key={stage} className="flex justify-between gap-3">
                <span className="text-muted-foreground">{LEAD_STAGE_LABEL[stage]}</span>
                <span className="tabular-nums">{pipeline.summary.leads.byStage[stage]}</span>
              </li>
            ))}
          </ul>
          {pipeline.summary.proposals.openAmountByCurrency.map((entry) => (
            <p key={entry.currency} className="text-sm text-muted-foreground">
              Open proposals {formatMoney(entry.amount, entry.currency)}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pipeline.reason}</p>
      )}
    </section>
  );
}
