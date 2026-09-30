import { ModuleStub, StubTable } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/reviews");

export const metadata = { title: item.label };

export default function ReviewsPage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="Review links and Frame.io projects, tied to a client and a delivery."
      adapter={item.adapter}
    >
      <StubTable
        columns={["Client", "Project", "Review link", "Status"]}
        emptyTitle="No cuts in review."
        emptyBody="When a project has a Frame.io link, it will show in this list. This page does not call Frame.io."
      />
    </ModuleStub>
  );
}
