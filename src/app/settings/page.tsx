import Link from "next/link";

import { EmptyState } from "@/components/studio/empty-state";
import { ModuleStub } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/settings");

export const metadata = { title: item.label };

const PROFILE = [
  { label: "Studio name", value: "Not set in this shell" },
  { label: "Timezone", value: "Not set in this shell" },
  { label: "Mark", value: "Not set in this shell" },
] as const;

const INTEGRATIONS = [
  { name: "ClickUp", note: "Shoot schedules and the production list." },
  { name: "GoHighLevel", note: "Pipeline, before a lead becomes Client Work." },
  { name: "Frame.io", note: "Review links on a client and a project." },
  { name: "QuickBooks", note: "Quotes, invoices, and payments." },
] as const;

const PORTALS = [
  { href: "/staff", label: "Staff portal", note: "Crew entry. Role gating comes later." },
  { href: "/portal", label: "Client portal", note: "Client entry. Role gating comes later." },
] as const;

export default function SettingsPage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="Studio profile, and the systems this console will connect."
      adapter={item.adapter}
    >
      <section>
        <h2 className="mb-3 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Studio profile
        </h2>
        <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {PROFILE.map((row) => (
            <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-baseline">
              <dt className="text-sm">{row.label}</dt>
              <dd className="text-sm text-muted-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Integrations
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {INTEGRATIONS.map((integration) => (
            <li key={integration.name} className="flex items-baseline justify-between gap-4 px-4 py-3">
              <span className="min-w-0">
                <span className="block text-sm">{integration.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{integration.note}</span>
              </span>
              <span className="shrink-0 text-[0.68rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Not connected
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <EmptyState
            title="No adapter is connected."
            body="These rows are placeholders. This shell does not start OAuth or store a token."
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Portal apps (separate entry)
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {PORTALS.map((portal) => (
            <li key={portal.href}>
              <Link href={portal.href} className="block px-4 py-3 hover:bg-muted/60">
                <span className="block text-sm">{portal.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{portal.note}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Staff and client portals are not on the main rail. They stay separate apps until role gating exists.
        </p>
      </section>
    </ModuleStub>
  );
}
