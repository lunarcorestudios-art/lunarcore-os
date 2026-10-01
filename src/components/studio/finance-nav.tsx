import { FilterPill } from "@/components/ui/filter-pill";

const LINKS = [
  { id: "overview", href: "/finance", label: "Overview" },
  { id: "quotes", href: "/finance/quotes", label: "Quotes" },
  { id: "invoices", href: "/finance/invoices", label: "Invoices" },
  { id: "payments", href: "/finance/payments", label: "Payments" },
] as const;

export function FinanceNav({ current }: { current: (typeof LINKS)[number]["id"] }) {
  return (
    <nav aria-label="Finance" className="mb-8 flex flex-wrap gap-1.5">
      {LINKS.map((link) => (
        <FilterPill key={link.id} href={link.href} active={link.id === current}>
          {link.label}
        </FilterPill>
      ))}
    </nav>
  );
}
