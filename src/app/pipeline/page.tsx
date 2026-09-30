import Link from "next/link";

import { EmptyState } from "@/components/studio/empty-state";
import { ModuleStub, StubBoard } from "@/components/studio/module-stub";
import { navItem, navSectionFor } from "@/components/shell/nav";

const item = navItem("/pipeline");

export const metadata = { title: item.label };

const STAGES = [
  { label: "New", detail: "No leads in this shell." },
  { label: "Qualified", detail: "No leads in this shell." },
  { label: "Proposal", detail: "No deals in this shell." },
  { label: "Won", detail: "No deals in this shell." },
] as const;

export default function PipelinePage() {
  const section = navSectionFor(item.href);

  return (
    <ModuleStub
      kicker={section.label}
      title={item.label}
      purpose="Leads and deals from GoHighLevel, before they become Client Work."
      adapter={item.adapter}
    >
      <StubBoard columns={STAGES} />
      <div className="mt-6">
        <EmptyState
          title="GoHighLevel is not connected."
          body="This board stays empty until that adapter exists. The dashboard still reads the studio seed pipeline."
        />
      </div>
      <p className="mt-4">
        <Link href="/" className="text-sm font-medium text-accent underline-offset-4 hover:underline">
          Seed pipeline on the dashboard
        </Link>
      </p>
    </ModuleStub>
  );
}
