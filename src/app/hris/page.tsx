import { ModuleStub, StubMetrics, StubTable } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/hris");

export const metadata = { title: item.label };

export default function HrisPage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="Roster, roles, and time off for the people who run the studio."
      adapter={item.adapter}
    >
      <StubMetrics
        items={[
          { label: "Headcount", hint: "Waiting on HRIS" },
          { label: "Open roles", hint: "Waiting on HRIS" },
          { label: "Out today", hint: "Waiting on HRIS" },
        ]}
      />
      <div className="mt-8">
        <StubTable
          columns={["Person", "Role", "Status"]}
          emptyTitle="No roster in this shell."
          emptyBody="People records will come from the HRIS adapter. This page does not store employees."
        />
      </div>
    </ModuleStub>
  );
}
