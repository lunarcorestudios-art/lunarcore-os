import Link from "next/link";

import { EmptyState } from "@/components/studio/empty-state";
import { HealthBadge } from "@/components/studio/health-badge";
import { PageHeader } from "@/components/studio/page-header";
import { StatusBadge } from "@/components/studio/status-badge";
import { Input } from "@/components/ui/input";
import { CLIENT_STATUSES } from "@/lib/studio/types";
import { CLIENT_STATUS_LABEL } from "@/lib/studio/labels";
import { loadDirectory } from "@/lib/studio/view";
import { cn } from "@/lib/utils";

export const metadata = { title: "Clients" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = first(params.status);
  const query = first(params.q) ?? "";
  const directory = await loadDirectory({ status, query });

  return (
    <>
      <PageHeader
        kicker="Client Work"
        title="Clients"
        lede="Folders in Client Work. Each list under a folder is a project on the floor."
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Client status" className="flex flex-wrap gap-1.5">
          <FilterLink href={filterHref(undefined, query)} active={!directory.status}>
            All
          </FilterLink>
          {CLIENT_STATUSES.map((item) => (
            <FilterLink key={item} href={filterHref(item, query)} active={directory.status === item}>
              {CLIENT_STATUS_LABEL[item]}
            </FilterLink>
          ))}
        </nav>
        <form action="/clients" className="sm:w-64">
          {directory.status ? <input type="hidden" name="status" value={directory.status} /> : null}
          <Input name="q" defaultValue={directory.query} placeholder="Filter clients" aria-label="Filter clients" />
        </form>
      </div>
      {directory.rows.length === 0 ? (
        <EmptyState title="No clients in this cut." body="Try another status, or clear the filter." />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {directory.rows.map((row) => (
            <li key={row.client.id}>
              <Link
                href={`/clients/${row.client.id}`}
                className="grid gap-2 px-4 py-4 hover:bg-muted/60 sm:grid-cols-[minmax(0,1.5fr)_140px_110px_120px] sm:items-center sm:gap-4"
              >
                <span className="min-w-0">
                  <span className="block truncate font-display text-2xl leading-tight tracking-tight">
                    {row.client.name}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground sm:hidden">
                    {row.client.industry ?? "Client"} · {row.projectCount}{" "}
                    {row.projectCount === 1 ? "project" : "projects"}
                  </span>
                </span>
                <span className="hidden text-sm text-muted-foreground sm:block">{row.client.industry ?? "Not set"}</span>
                <StatusBadge status={row.client.status} kind="client" />
                <span className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-sm text-muted-foreground sm:hidden">
                    {row.projectCount} {row.projectCount === 1 ? "project" : "projects"}
                  </span>
                  {row.health ? <HealthBadge health={row.health} /> : <span className="text-sm text-muted-foreground">No projects</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground tabular-nums">{directory.total} in this view</p>
    </>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs tracking-wide",
        active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function filterHref(status: string | undefined, query: string): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (query) params.set("q", query);
  const text = params.toString();
  return text ? `/clients?${text}` : "/clients";
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
