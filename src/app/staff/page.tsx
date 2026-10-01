import { EmptyState } from "@/components/studio/empty-state";
import { ModuleStub } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/staff");

export const metadata = { title: item.label };

const SLOTS = [
  {
    title: "Assignments",
    heading: "Nothing on your slate.",
    body: "Jobs assigned to you will show here once the portal can tell who is signed in.",
  },
  {
    title: "Time off",
    heading: "No requests.",
    body: "Time off will come from HRIS. This shell does not accept a request.",
  },
  {
    title: "Reviews",
    heading: "None waiting.",
    body: "Frame.io reviews assigned to you will land here later.",
  },
] as const;

export default function StaffPortalPage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="A separate crew entry, not on the main rail. Sign-in is not gated by role yet."
      adapter={item.adapter}
    >
      <ul className="grid gap-4 lg:grid-cols-3">
        {SLOTS.map((slot) => (
          <li key={slot.title}>
            <p className="mb-3 text-sm font-semibold tracking-tight text-foreground">
              {slot.title}
            </p>
            <EmptyState title={slot.heading} body={slot.body} />
          </li>
        ))}
      </ul>
    </ModuleStub>
  );
}
