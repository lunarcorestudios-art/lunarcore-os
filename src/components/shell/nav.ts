/**
 * Primary navigation and the module → adapter map.
 *
 * Live routes read `StudioClient` (in-memory seed, or the HTTP bridge to
 * lunarcore-mcp). Stub routes render empty shells. They do not call
 * ClickUp, Frame.io, GoHighLevel, QuickBooks, or an HRIS.
 *
 * | Section | Route              | Module          | Adapter              | Status |
 * | ------- | ------------------ | --------------- | -------------------- | ------ |
 * | Studio  | /                  | Dashboard       | StudioClient         | live   |
 * | Studio  | /clients           | Clients         | StudioClient         | live   |
 * | Studio  | /delivery          | Delivery        | StudioClient         | live   |
 * | Studio  | /shoots            | Shoot Schedules | ClickUp + calendar   | stub   |
 * | Studio  | /reviews           | Reviews         | Frame.io             | stub   |
 * | Growth  | /pipeline          | Pipeline        | GoHighLevel          | stub   |
 * | People  | /hris              | HRIS            | HRIS                 | stub   |
 * | People  | /staff             | Staff Portal    | Role gating          | stub   |
 * | Client  | /portal            | Client Portal   | Role gating          | stub   |
 * | Finance | /finance           | Finance Portal  | QuickBooks           | stub   |
 * | Finance | /finance/quotes    | Quotes          | QuickBooks           | stub   |
 * | Finance | /finance/invoices  | Invoices        | QuickBooks           | stub   |
 *
 * Staff and Client portals are ungated shells. Role checks come later.
 * Quotes and invoices will be owned by Intuit QuickBooks, not this app.
 */

export type NavStatus = "live" | "stub";

export type NavItem = {
  href: string;
  label: string;
  /** System that owns, or will own, this module. */
  adapter: string;
  status: NavStatus;
};

export type NavSection = {
  id: string;
  label: string;
  items: readonly NavItem[];
};

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    id: "studio",
    label: "Studio",
    items: [
      { href: "/", label: "Dashboard", adapter: "StudioClient", status: "live" },
      { href: "/clients", label: "Clients", adapter: "StudioClient", status: "live" },
      { href: "/delivery", label: "Delivery", adapter: "StudioClient", status: "live" },
      { href: "/shoots", label: "Shoot Schedules", adapter: "ClickUp + calendar", status: "stub" },
      { href: "/reviews", label: "Reviews", adapter: "Frame.io", status: "stub" },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    items: [{ href: "/pipeline", label: "Pipeline", adapter: "GoHighLevel", status: "stub" }],
  },
  {
    id: "people",
    label: "People",
    items: [
      { href: "/hris", label: "HRIS", adapter: "HRIS", status: "stub" },
      { href: "/staff", label: "Staff Portal", adapter: "Role gating", status: "stub" },
    ],
  },
  {
    id: "client",
    label: "Client",
    items: [{ href: "/portal", label: "Client Portal", adapter: "Role gating", status: "stub" }],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { href: "/finance", label: "Finance Portal", adapter: "QuickBooks", status: "stub" },
      { href: "/finance/quotes", label: "Quotes", adapter: "QuickBooks", status: "stub" },
      { href: "/finance/invoices", label: "Invoices", adapter: "QuickBooks", status: "stub" },
    ],
  },
];

export function navItem(href: string): NavItem {
  const item = NAV_SECTIONS.flatMap((section) => section.items).find((entry) => entry.href === href);
  if (!item) {
    throw new Error(`Unknown nav href: ${href}`);
  }
  return item;
}

export function navSectionFor(href: string): NavSection {
  const section = NAV_SECTIONS.find((entry) => entry.items.some((item) => item.href === href));
  if (!section) {
    throw new Error(`Unknown nav href: ${href}`);
  }
  return section;
}

/** Highlight the most specific nav href that matches the pathname. */
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
