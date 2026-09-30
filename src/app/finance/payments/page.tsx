import { FinanceNav } from "@/components/studio/finance-nav";
import { ModuleStub, StubTable } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/finance/payments");

export const metadata = { title: item.label };

export default function PaymentsPage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="What the studio has collected. QuickBooks will own payments."
      adapter={item.adapter}
    >
      <FinanceNav current="payments" />
      <StubTable
        columns={["Payment", "Client", "Amount", "Status"]}
        emptyTitle="No payments in this shell."
        emptyBody="Collected payments will come from QuickBooks. This list does not record one."
      />
    </ModuleStub>
  );
}
