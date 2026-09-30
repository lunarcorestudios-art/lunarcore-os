/**
 * Primary navigation and the module → adapter map.
 *
 * Live routes read `StudioClient` (in-memory seed, or the HTTP bridge to
 * lunarcore-mcp). Stub routes render empty shells. They do not call
 * ClickUp, Frame.io, GoHighLevel, QuickBooks, or an HRIS.
 *
 * Primary rail (internal Studio OS):
 *
 * | Rail        | Route     | Module          | Adapter            | Status |
 * | ----------- | --------- | --------------- | ------------------ | ------ |
 * | Home        | /         | Dashboard       | StudioClient       | live   |
 * | Clients     | /clients  | Clients         | StudioClient       | live   |
 * | Production  | /delivery | Delivery        | StudioClient       | live   |
 * | Production  | /shoots   | Shoot Schedules | ClickUp + calendar | stub   |
 * | Production  | /reviews  | Reviews         | Frame.io           | stub   |
 * | Pipeline    | /pipeline | Pipeline        | GoHighLevel        | stub   |
 * | Finance     | /finance  | Finance         | QuickBooks         | stub   |
 * | People      | /people   | People          | HRIS               | stub   |
 * | Settings    | /settings | Settings        | Integrations       | stub   |
 *
 * Finance tabs live under `/finance`, not as peer rail items:
 * Overview `/finance`, Quotes `/finance/quotes`, Invoices `/finance/invoices`,
 * Payments `/finance/payments`. QuickBooks will own quotes, invoices, and payments.
 *
 * `/staff` (Staff Portal) and `/portal` (Client Portal) stay as shells but are
 * not on the primary rail. They are separate entry apps, noted on Settings.
 * Role gating comes later. `/hris` redirects to `/people`.
 */

export type NavStatus = "live" | "stub";

export type NavItem = {
  href: string;
  label: string;
  /** System that owns, or will own, this module. */
  adapter: string;
  status: NavStatus;
  /** Page kicker when the item has no rail section label. */
  kicker: string;
};

export type NavSection = {
  id: string;
  /** Omitted for top-level destinations that are not a labeled group. */
  label?: string;
  items: readonly NavItem[];
};

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    id: "primary",
    items: [
      { href: "/", label: "Home", adapter: "StudioClient", status: "live", kicker: "Home" },
      { href: "/clients", label: "Clients", adapter: "StudioClient", status: "live", kicker: "Clients" },
    ],
  },
  {
    id: "production",
    label: "Production",
    items: [
      { href: "/delivery", label: "Delivery", adapter: "StudioClient", status: "live", kicker: "Production" },
      { href: "/shoots", label: "Shoot Schedules", adapter: "ClickUp + calendar", status: "stub", kicker: "Production" },
      { href: "/reviews", label: "Reviews", adapter: "Frame.io", status: "stub", kicker: "Production" },
    ],
  },
  {
    id: "operations",
    items: [
      { href: "/pipeline", label: "Pipeline", adapter: "GoHighLevel", status: "stub", kicker: "Growth" },
      { href: "/finance", label: "Finance", adapter: "QuickBooks", status: "stub", kicker: "Finance" },
      { href: "/people", label: "People", adapter: "HRIS", status: "stub", kicker: "Studio" },
      { href: "/settings", label: "Settings", adapter: "Integrations", status: "stub", kicker: "Studio" },
    ],
  },
];

/** Finance children. Tabs on the finance pages, not sidebar peers. */
const FINANCE_TABS: readonly NavItem[] = [
  { href: "/finance/quotes", label: "Quotes", adapter: "QuickBooks", status: "stub", kicker: "Finance" },
  { href: "/finance/invoices", label: "Invoices", adapter: "QuickBooks", status: "stub", kicker: "Finance" },
  { href: "/finance/payments", label: "Payments", adapter: "QuickBooks", status: "stub", kicker: "Finance" },
];

/**
 * Portal shells kept off the primary rail.
 * Settings links them as separate entry apps.
 */
const UNLINKED_PORTALS: readonly NavItem[] = [
  { href: "/staff", label: "Staff Portal", adapter: "Role gating", status: "stub", kicker: "Portal apps" },
  { href: "/portal", label: "Client Portal", adapter: "Role gating", status: "stub", kicker: "Portal apps" },
];

const OFF_RAIL: readonly NavItem[] = [...FINANCE_TABS, ...UNLINKED_PORTALS];

export function navItem(href: string): NavItem {
  const item =
    NAV_SECTIONS.flatMap((section) => section.items).find((entry) => entry.href === href) ??
    OFF_RAIL.find((entry) => entry.href === href);
  if (!item) {
    throw new Error(`Unknown nav href: ${href}`);
  }
  return item;
}

export function navSectionFor(href: string): NavSection & { label: string } {
  const section = NAV_SECTIONS.find((entry) => entry.items.some((item) => item.href === href));
  if (section?.label) return { ...section, label: section.label };
  const item = navItem(href);
  return { id: item.kicker.toLowerCase().replaceAll(" ", "-"), label: item.kicker, items: [] };
}

/** Highlight the most specific primary-rail href that matches the pathname. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const matches = pathname === href || pathname.startsWith(`${href}/`);
  if (!matches) return false;

  const hrefs = NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.href));
  const coveredByLongerItem = hrefs.some((other) => {
    if (other === href || other.length <= href.length) return false;
    return pathname === other || pathname.startsWith(`${other}/`);
  });
  return !coveredByLongerItem;
}
