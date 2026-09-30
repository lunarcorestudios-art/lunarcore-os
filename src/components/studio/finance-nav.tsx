import Link from "next/link";

import { cn } from "@/lib/utils";

const LINKS = [
  { id: "overview", href: "/finance", label: "Overview" },
  { id: "quotes", href: "/finance/quotes", label: "Quotes" },
  { id: "invoices", href: "/finance/invoices", label: "Invoices" },
  { id: "payments", href: "/finance/payments", label: "Payments" },
] as const;

export function FinanceNav({ current }: { current: (typeof LINKS)[number]["id"] }) {
  return (
    <nav aria-label="Finance" className="mb-8 flex flex-wrap gap-1.5">
      {LINKS.map((link) => {
        const active = link.id === current;
        return (
          <Link
            key={link.id}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs tracking-wide",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
