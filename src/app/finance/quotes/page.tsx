import { FinanceNav } from "@/components/studio/finance-nav";
import { ModuleStub, StubTable } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/finance/quotes");

export const metadata = { title: item.label };

export default function QuotesPage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="Proposals before they become invoices. QuickBooks will own quotes."
      adapter={item.adapter}
    >
      <FinanceNav current="quotes" />
      <StubTable
        columns={["Quote", "Client", "Amount", "Status"]}
        emptyTitle="No quotes in this shell."
        emptyBody="Open quotes will come from QuickBooks. This list does not draft or store a quote."
      />
    </ModuleStub>
  );
}
