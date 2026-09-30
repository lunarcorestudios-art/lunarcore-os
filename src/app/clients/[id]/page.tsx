import type { Metadata } from "next";
import Link from "next/link";

import { DeliveryCard } from "@/components/studio/delivery-card";
import { EmptyState } from "@/components/studio/empty-state";
import { MissingRecord } from "@/components/studio/missing-record";
import { PageHeader } from "@/components/studio/page-header";
import { StatusBadge } from "@/components/studio/status-badge";
import { getStudioClient } from "@/lib/studio/client";
import { StudioNotFound } from "@/lib/studio/errors";
import { loadClientDetail } from "@/lib/studio/view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const client = await (await getStudioClient()).getClient(id);
    return { title: client.name };
  } catch (error) {
    if (error instanceof StudioNotFound) return { title: "Client" };
    throw error;
  }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let detail;
  try {
    detail = await loadClientDetail(id);
  } catch (error) {
    if (error instanceof StudioNotFound) return <MissingRecord kind="client" />;
    throw error;
  }
  const { client } = detail;

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        <Link href="/clients" className="hover:text-foreground">
          Clients
        </Link>
      </p>
      <PageHeader
        kicker={client.industry ?? "Client"}
        title={client.name}
        lede={client.notes}
        actions={<StatusBadge status={client.status} kind="client" />}
      />
      {client.primaryContact?.email ? (
        <p className="mb-8 text-sm text-muted-foreground">
          {client.primaryContact.name ? `${client.primaryContact.name} · ` : ""}
          <a className="underline-offset-4 hover:underline" href={`mailto:${client.primaryContact.email}`}>
            {client.primaryContact.email}
          </a>
        </p>
      ) : null}
      <h2 className="mb-3 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">Projects</h2>
      {detail.deliveries.length === 0 ? (
        <EmptyState
          title="No projects yet."
          body="When a list lands under this client folder, it shows up here with a delivery rollup."
        />
      ) : (
        <div className="space-y-4">
          {detail.deliveries.map((delivery) => (
            <DeliveryCard key={delivery.project.id} delivery={delivery} />
          ))}
        </div>
      )}
    </>
  );
}
