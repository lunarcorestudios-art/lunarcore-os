"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { isNavActive, NAV_SECTIONS } from "@/components/shell/nav";
import { SearchDialog } from "@/components/shell/search-dialog";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Mark } from "@/components/studio/mark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Actor } from "@/lib/studio/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AppShell({
  actor,
  workspaceName,
  caption,
  children,
}: {
  actor: Actor;
  workspaceName: string;
  caption: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-sidebar md:flex">
        <Brand workspaceName={workspaceName} />
        <Nav pathname={pathname} />
        <SidebarFooter actor={actor} caption={caption} />
      </aside>
      <div className="studio-canvas flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md md:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </Button>
          <div className="min-w-0 md:hidden">
            <p className="truncate font-display text-lg leading-none tracking-tight">{workspaceName}</p>
          </div>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
            <SearchDialog />
            <ThemeToggle />
            <div className="hidden items-center gap-3 pl-1 sm:flex">
              <div className="text-right">
                <p className="text-sm leading-tight">{actor.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{actor.role}</p>
              </div>
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-full border border-border bg-muted text-xs font-medium"
              >
                {initials(actor.name)}
              </span>
            </div>
          </div>
        </header>
        <main id="content" className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-8 md:px-8 md:py-10">
          {children}
        </main>
      </div>
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="top-4 flex max-h-[calc(100dvh-2rem)] flex-col p-5">
          <DialogTitle>Navigate</DialogTitle>
          <DialogDescription>{workspaceName}</DialogDescription>
          <nav className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1" aria-label="Mobile">
            <NavList pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Brand({ workspaceName }: { workspaceName: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3 px-5 py-5">
      <Mark className="size-8 text-accent" />
      <span>
        <span className="block font-display text-xl leading-none tracking-tight">Lunarcore</span>
        <span className="mt-1 block text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase">
          {workspaceName === "Lunarcore Studios" ? "Studios OS" : workspaceName}
        </span>
      </span>
    </Link>
  );
}

function Nav({ pathname }: { pathname: string }) {
  return (
    <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-6" aria-label="Studio">
      <NavList pathname={pathname} />
    </nav>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="space-y-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.id}>
          {section.label ? (
            <p className="px-3 pb-2 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {section.label}
            </p>
          ) : null}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SidebarFooter({ actor, caption }: { actor: Actor; caption: string }) {
  return (
    <div className="mt-auto shrink-0 border-t border-border px-5 py-4">
      <p className="text-sm">{actor.name}</p>
      <p className="text-xs text-muted-foreground capitalize">{actor.role}</p>
      <p className="mt-3 text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">{caption}</p>
    </div>
  );
}

