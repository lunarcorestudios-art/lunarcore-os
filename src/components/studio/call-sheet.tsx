import Link from "next/link";

import { ShootStatusBadge } from "@/components/studio/shoot-status-badge";
import { formatCallTime, formatDay } from "@/lib/format";
import type { ShootRow } from "@/lib/studio/view";

export function CallSheet({ row }: { row: ShootRow }) {
  const { shoot } = row;
  const crew =
    shoot.crewCount === 1 ? "1 person" : `${shoot.crewCount} people`;

  return (
    <article>
      <p className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">Call sheet</p>
      <h2 className="mt-2 font-display text-4xl leading-none tracking-tight">{shoot.title}</h2>
      <div className="mt-4">
        <ShootStatusBadge status={shoot.status} />
      </div>
      <dl className="mt-6 divide-y divide-border border-y border-border">
        <Row label="Client">
          <Link href={`/clients/${shoot.clientId}`} className="hover:underline">
            {row.clientName}
          </Link>
        </Row>
        <Row label="Project">
          <Link href={`/delivery/${shoot.projectId}`} className="hover:underline">
            {row.projectName}
          </Link>
        </Row>
        <Row label="Date">{formatDay(shoot.date)}</Row>
        <Row label="Call">{formatCallTime(shoot.callTime)}</Row>
        <Row label="Wrap">{shoot.wrapTime ? formatCallTime(shoot.wrapTime) : "Not set"}</Row>
        <Row label="Location">{shoot.location}</Row>
        <Row label="Crew lead">{row.leadName ?? "Unassigned"}</Row>
        <Row label="Crew">{crew}</Row>
      </dl>
      <h3 className="mt-6 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Crew notes
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {shoot.crewNotes ?? "Crew notes will land here when the producer writes them."}
      </p>
      <p className="mt-6 text-xs text-muted-foreground">Call and wrap times are Philippine time.</p>
    </article>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
