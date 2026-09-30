import { EmptyState } from "@/components/studio/empty-state";
import { ModuleStub } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const item = navItem("/shoots");

export const metadata = { title: item.label };

export default function ShootSchedulesPage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="Call times and locations for production days."
      adapter={item.adapter}
    >
      <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4 lg:grid-cols-7">
        {DAYS.map((day) => (
          <li key={day} className="min-h-32 bg-card px-3 py-3">
            <p className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">{day}</p>
            <p className="mt-8 text-sm text-muted-foreground">No call</p>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <EmptyState
          title="No shoots on the board."
          body="ClickUp will hold the production list, and a studio calendar will fill these days. This shell does not book anything."
        />
      </div>
    </ModuleStub>
  );
}
