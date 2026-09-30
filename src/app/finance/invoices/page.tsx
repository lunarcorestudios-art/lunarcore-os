import { FinanceNav } from "@/components/studio/finance-nav";
import { ModuleStub, StubTable } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/finance/invoices");

export const metadata = { title: item.label };

export default function InvoicesPage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="What clients owe. QuickBooks will own invoicing."
      adapter={item.adapter}
    >
      <FinanceNav current="invoices" />
      <StubTable
        columns={["Invoice", "Client", "Amount", "Status"]}
        emptyTitle="No invoices in this shell."
        emptyBody="Invoices will come from QuickBooks. This list does not issue or store one."
      />
    </ModuleStub>
  );
}