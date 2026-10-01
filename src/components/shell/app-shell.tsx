"use client";

import {
  CalendarDays,
  CirclePlay,
  Clapperboard,
  ContactRound,
  House,
  Menu,
  Settings,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { isNavActive, NAV_SECTIONS } from "@/components/shell/nav";
import { useStudioTheme } from "@/components/theme-provider";
import { SearchDialog } from "@/components/shell/search-dialog";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Actor } from "@/lib/studio/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/": House,
  "/clients": Users,
  "/delivery": Clapperboard,
  "/shoots": CalendarDays,
  "/reviews": CirclePlay,
  "/pipeline": Workflow,
  "/finance": Wallet,
  "/people": ContactRound,
  "/settings": Settings,
};

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
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-sidebar md:flex">
        <Brand />
        <Nav pathname={pathname} />
        <SidebarFooter caption={caption} />
      </aside>
      <div className="flex min-h-dvh min-w-0 flex-col bg-background">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background px-4 py-3 md:px-8">
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
          <Link href="/" className="flex min-w-0 items-center gap-2 md:hidden">
            <BrandMark className="size-7" />
            <span className="truncate font-display text-base font-semibold tracking-tight">Lunarcore OS</span>
          </Link>
          <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
            <SearchDialog />
            <ThemeToggle />
            <div className="hidden items-center gap-3 pl-1 sm:flex">
              <div className="text-right">
                <p className="text-sm leading-tight font-medium">{actor.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{actor.role}</p>
              </div>
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
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
        <DialogContent className="dialog-sheet top-4 left-4 flex h-[calc(100dvh-2rem)] w-[min(100%-2rem,20rem)] translate-x-0 flex-col p-5">
          <DialogTitle>Navigate</DialogTitle>
          <DialogDescription>{workspaceName}</DialogDescription>
          <nav className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1" aria-label="Mobile">
            <NavList pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          </nav>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-medium">{actor.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{actor.role}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative block shrink-0", className)}>
      <Image
        src="/brand/lunarcore-mark.png"
        alt=""
        fill
        sizes="32px"
        priority
        className="object-contain charcoal:hidden"
      />
      <Image
        src="/brand/lunarcore-mark-white.png"
        alt=""
        fill
        sizes="32px"
        priority
        className="hidden object-contain charcoal:block"
      />
    </span>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 px-5 py-5">
      <BrandMark className="size-8" />
      <span className="font-display text-[1.05rem] leading-none font-semibold tracking-tight">Lunarcore OS</span>
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
            <p className="px-3 pb-2 text-xs font-medium text-muted-foreground">{section.label}</p>
          ) : null}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = isNavActive(pathname, item.href);
              const Icon = NAV_ICONS[item.href];
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-accent-soft text-accent" : "text-foreground hover:bg-tint-soft",
                    )}
                  >
                    {Icon ? (
                      <Icon className={cn("size-4 shrink-0", active ? "text-accent" : "text-muted-foreground")} />
                    ) : null}
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

function SidebarFooter({ caption }: { caption: string }) {
  const { theme } = useStudioTheme();
  const charcoal = theme === "charcoal";

  return (
    <div className="mt-auto shrink-0 border-t border-border px-5 py-4">
      <p className="text-xs font-medium text-muted-foreground">{charcoal ? "Direction B" : "Direction A"}</p>
      <p className="mt-1 flex items-center gap-2 text-sm font-medium">
        {charcoal ? "Charcoal Studio" : "Daylight Console"}
        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}
