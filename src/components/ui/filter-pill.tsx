import Link from "next/link";

import { cn } from "@/lib/utils";

export function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card text-muted-foreground hover:border-tint hover:bg-tint-soft hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
