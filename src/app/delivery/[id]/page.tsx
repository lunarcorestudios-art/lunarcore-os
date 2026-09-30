import type { Metadata } from "next";
import Link from "next/link";

import { HealthBadge } from "@/components/studio/health-badge";
import { MissingRecord } from "@/components/studio/missing-record";
import { PageHeader } from "@/components/studio/page-header";
import { StatusBadge } from "@/components/studio/status-badge";
import { TaskMeter } from "@/components/studio/task-meter";
import { duePhrase, formatDay, isOverdue } from "@/lib/format";
import { getStudioClient } from "@/lib/studio/client";
import { StudioNotFound } from "@/lib/studio/errors";
import { MILESTONE_STATUS_LABEL, PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/studio/labels";
import { TASK_STATUSES } from "@/lib/studio/types";
import { loadDeliveryDetail } from "@/lib/studio/view";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const delivery = await (await getStudioClient()).deliveryStatus(id);
    return { title: delivery.project.name };
  } catch (error) {
    if (error instanceof StudioNotFound) return { title: "Delivery" };
    throw error;
  }
}

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let detail;
  try {
    detail = await loadDeliveryDetail(id);
  } catch (error) {
    if (error instanceof StudioNotFound) return <MissingRecord kind="project" />;
    throw error;
  }
  const { delivery } = detail;
  const { project, client } = delivery;
  const projectDue = duePhrase(project.dueDate);

  const groups = TASK_STATUSES.map((status) => ({
    status,
    tasks: detail.tasks.filter((record) => record.task.status === status),
  })).filter((group) => group.tasks.length > 0);

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        <Link href="/delivery" className="hover:text-foreground">
          Delivery
        </Link>
        <span aria-hidden="true"> · </span>
        <Link href={`/clients/${client.id}`} className="hover:text-foreground">
          {client.name}
        </Link>
      </p>
      <PageHeader
        kicker={client.name}
        title={project.name}
        lede={project.description}
        actions={<HealthBadge health={delivery.health} />}
      />
      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <StatusBadge status={project.status} kind="project" />
        {project.phase ? <span>{project.phase}</span> : null}
        {project.dueDate ? (
          <span>
            Due {formatDay(project.dueDate)}
            {projectDue ? ` · ${projectDue}` : ""}
          </span>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <section>
          <h2 className="mb-3 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Milestones
          </h2>
          {detail.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones on this project.</p>
          ) : (
            <ol className="space-y-3">
              {detail.milestones.map((milestone) => {
                const phrase = duePhrase(milestone.dueDate);
                const late = milestone.status !== "done" && isOverdue(milestone.dueDate);
                return (
                  <li key={milestone.id} className="rounded-lg border border-border bg-card px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm">{milestone.name}</p>
                      <span className="text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">
                        {MILESTONE_STATUS_LABEL[milestone.status]}
                      </span>
                    </div>
                    {milestone.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
                    ) : null}
                    {milestone.dueDate ? (
                      <p className={cn("mt-2 text-xs", late ? "text-warning" : "text-muted-foreground")}>
                        {formatDay(milestone.dueDate)}
                        {phrase ? ` · ${phrase}` : ""}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          )}
          <div className="mt-6 rounded-lg border border-border bg-card px-4 py-4">
            <TaskMeter byStatus={delivery.tasks.byStatus} total={delivery.tasks.total} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">Tasks</h2>
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.status}>
                <h3 className="mb-2 text-sm text-muted-foreground">{TASK_STATUS_LABEL[group.status]}</h3>
                <ul className="space-y-3">
                  {group.tasks.map((record) => (
                    <li id={record.task.id} key={record.task.id} className="scroll-mt-24 rounded-lg border border-border bg-card px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm">{record.task.title}</p>
                        <span className="shrink-0 text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase">
                          {PRIORITY_LABEL[record.task.priority]}
                        </span>
                      </div>
                      {record.task.description ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{record.task.description}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {[
                          record.assigneeName,
                          record.task.dueDate ? duePhrase(record.task.dueDate) : null,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Unassigned"}
                      </p>
                      {record.comments.length > 0 ? (
                        <ul className="mt-3 space-y-2 border-t border-border pt-3">
                          {record.comments.map((comment) => (
                            <li key={comment.id} className="text-sm leading-relaxed">
                              <span className="text-muted-foreground">
                                {comment.authorId
                                  ? (detail.commentsByAuthor.get(comment.authorId) ?? "Studio")
                                  : "Studio"}
                                :{" "}
                              </span>
                              {comment.body}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
