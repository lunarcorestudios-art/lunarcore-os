import { ExternalLink } from "lucide-react";

import { EmptyState } from "@/components/studio/empty-state";
import { FilterChip } from "@/components/studio/filter-chip";
import { PageHeader } from "@/components/studio/page-header";
import { ReviewStatusBadge } from "@/components/studio/review-status-badge";
import { Button } from "@/components/ui/button";
import { externalHttpsUrl, formatDay } from "@/lib/format";
import { REVIEW_STATUS_LABEL } from "@/lib/studio/labels";
import { REVIEW_STATUSES, type ReviewStatus } from "@/lib/studio/types";
import { loadReviewBoard } from "@/lib/studio/view";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const board = await loadReviewBoard({
    status: first(params.status),
    clientId: first(params.client),
  });

  return (
    <>
      <PageHeader
        kicker="Production"
        title="Reviews"
        lede="Frame.io project and review links, stored with the client and the job. This page does not sign in to Frame.io."
      />
      <dl className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        {REVIEW_STATUSES.map((status) => (
          <div key={status} className="bg-card px-4 py-4">
            <dt className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {REVIEW_STATUS_LABEL[status]}
            </dt>
            <dd className="mt-2 font-display text-4xl tracking-tight tabular-nums">{board.counts[status]}</dd>
          </div>
        ))}
      </dl>
      <div className="mb-6 flex flex-col gap-3">
        <nav aria-label="Review status" className="flex flex-wrap gap-1.5">
          <FilterChip href={reviewsHref({ clientId: board.clientId })} active={!board.status}>
            All
          </FilterChip>
          {REVIEW_STATUSES.map((status) => (
            <FilterChip
              key={status}
              href={reviewsHref({ status, clientId: board.clientId })}
              active={board.status === status}
            >
              {REVIEW_STATUS_LABEL[status]}
            </FilterChip>
          ))}
        </nav>
        {board.clients.length > 1 ? (
          <nav aria-label="Client" className="flex flex-wrap gap-1.5">
            <FilterChip href={reviewsHref({ status: board.status })} active={!board.clientId}>
              All clients
            </FilterChip>
            {board.clients.map((client) => (
              <FilterChip
                key={client.id}
                href={reviewsHref({ status: board.status, clientId: client.id })}
                active={board.clientId === client.id}
              >
                {client.name}
              </FilterChip>
            ))}
          </nav>
        ) : null}
      </div>

      {board.totalInStudio === 0 ? (
        <EmptyState
          title="No cuts in review."
          body="When a project has a Frame.io link on the studio record, it will show in this list. This page does not call Frame.io."
        />
      ) : board.rows.length === 0 ? (
        <EmptyState title="Nothing in this cut." body="Try another status, or clear the client filter." />
      ) : (
        <ul className="space-y-3">
          {board.rows.map((row) => {
            const href = externalHttpsUrl(row.review.frameUrl);
            return (
              <li
                key={row.review.id}
                id={row.review.id}
                className="rounded-lg border border-border bg-card px-4 py-4 sm:px-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                      {row.clientName}
                    </p>
                    <h2 className="mt-1 font-display text-3xl leading-none tracking-tight">{row.review.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{row.projectName}</p>
                  </div>
                  <ReviewStatusBadge status={row.review.status} />
                </div>
                {row.review.notes ? (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{row.review.notes}</p>
                ) : null}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="min-w-0 text-sm text-muted-foreground">
                    <span className="tabular-nums">Updated {formatDay(row.review.updatedAt.slice(0, 10))}</span>
                    {href ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all underline-offset-4 hover:text-foreground hover:underline"
                        >
                          {href.replace(/^https:\/\//, "")}
                        </a>
                      </>
                    ) : (
                      <span> · Link unavailable</span>
                    )}
                  </p>
                  {href ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        Open in Frame.io
                        <ExternalLink />
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Open in Frame.io
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground tabular-nums">{board.rows.length} in this view</p>
    </>
  );
}

function reviewsHref(input: { status?: ReviewStatus; clientId?: string }): string {
  const params = new URLSearchParams();
  if (input.status) params.set("status", input.status);
  if (input.clientId) params.set("client", input.clientId);
  const text = params.toString();
  return text ? `/reviews?${text}` : "/reviews";
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
