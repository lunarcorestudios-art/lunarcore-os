import { EmptyState } from "@/components/studio/empty-state";
import { ModuleStub } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/portal");

export const metadata = { title: item.label };

const SLOTS = [
  {
    title: "Projects",
    heading: "No projects in this view.",
    body: "A client's Client Work projects will appear here once this portal knows who is visiting.",
  },
  {
    title: "Reviews",
    heading: "No links yet.",
    body: "Frame.io reviews shared with the client will show here. Nothing is shared from this shell.",
  },
  {
    title: "Invoices",
    heading: "No invoices.",
    body: "QuickBooks invoices for the client account will show here later.",
  },
] as const;

export default function ClientPortalPage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="What a client sees of their work. Sign-in is not gated by role yet."
      adapter={item.adapter}
    >
      <ul className="grid gap-4 lg:grid-cols-3">
        {SLOTS.map((slot) => (
          <li key={slot.title}>
            <p className="mb-3 text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {slot.title}
            </p>
            <EmptyState title={slot.heading} body={slot.body} />
          </li>
        ))}
      </ul>
    </ModuleStub>
  );
}
