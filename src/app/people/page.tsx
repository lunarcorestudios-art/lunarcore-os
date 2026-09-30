import { ModuleStub, StubMetrics, StubTable } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/people");

export const metadata = { title: item.label };

export default function PeoplePage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="Roster, capacity, and time off for the people who run the studio."
      adapter={item.adapter}
    >
      <StubMetrics
        items={[
          { label: "Roster", hint: "Waiting on HRIS" },
          { label: "Capacity", hint: "Waiting on HRIS" },
          { label: "Time off", hint: "Waiting on HRIS" },
        ]}
      />
      <div className="mt-8">
        <StubTable
          columns={["Person", "Role", "Capacity"]}
          emptyTitle="No roster in this shell."
          emptyBody="Headcount, who is booked, and who is out will come from the HRIS. This page does not store people."
        />
      </div>
    </ModuleStub>
  );
}
