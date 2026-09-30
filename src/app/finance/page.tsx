import Link from "next/link";

import { FinanceNav } from "@/components/studio/finance-nav";
import { EmptyState } from "@/components/studio/empty-state";
import { ModuleStub, StubMetrics } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/finance");

export const metadata = { title: item.label };

export default function FinancePage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="Quotes, invoices, and what the studio has collected."
      adapter={item.adapter}
    >
      <FinanceNav current="overview" />
      <StubMetrics
        items={[
          { label: "Open quotes", hint: "Waiting on QuickBooks" },
          { label: "Open invoices", hint: "Waiting on QuickBooks" },
          { label: "Collected", hint: "Nothing posted here" },
        ]}
      />
      <div className="mt-8">
        <EmptyState
          title="The ledger is not connected."
          body="QuickBooks will own quotes and invoices. This page will read that ledger. It does not store money."
        />
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        <li>
          <Link href="/finance/quotes" className="block rounded-lg border border-border bg-card px-4 py-4 hover:bg-muted/60">
            <span className="block text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Quotes
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">Proposals before they become invoices.</span>
          </Link>
        </li>
        <li>
          <Link href="/finance/invoices" className="block rounded-lg border border-border bg-card px-4 py-4 hover:bg-muted/60">
            <span className="block text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Invoices
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">What clients owe, once QuickBooks is connected.</span>
          </Link>
        </li>
      </ul>
    </ModuleStub>
  );
}
