import Link from "next/link";

import { CallSheet } from "@/components/studio/call-sheet";
import { EmptyState } from "@/components/studio/empty-state";
import { FilterChip } from "@/components/studio/filter-chip";
import { PageHeader } from "@/components/studio/page-header";
import { ShootCalendar, ShootList } from "@/components/studio/shoot-board";
import { ShootDrawer } from "@/components/studio/shoot-drawer";
import { SHOOT_WINDOW_LABEL } from "@/lib/studio/labels";
import { SHOOT_WINDOWS, type ShootWindow } from "@/lib/studio/types";
import { loadShootBoard, type ScheduleView } from "@/lib/studio/view";

export const metadata = { title: "Shoot Schedules" };

export default async function ShootSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const board = await loadShootBoard({
    window: first(params.window),
    clientId: first(params.client),
    view: first(params.view),
    shootId: first(params.shoot),
  });
  const hrefFor = (shootId?: string) =>
    shootsHref({
      window: board.window,
      clientId: board.clientId,
      view: board.view,
      shootId,
    });
  const weekDays = new Set(board.week);
  const weekRows = board.rows.filter((row) => weekDays.has(row.shoot.date));
  const displayed = board.view === "week" ? weekRows : board.rows;
  const outsideWeek = board.view === "week" ? board.rows.length - weekRows.length : 0;

  return (
    <>
      <PageHeader
        kicker="Production"
        title="Shoot schedules"
        lede="Call times and locations for the floor. Live ClickUp tasks show up here once a bridge maps them. This app does not hold a token."
      />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Schedule window" className="flex flex-wrap gap-1.5">
          {SHOOT_WINDOWS.map((window) => (
            <FilterChip
              key={window}
              href={shootsHref({
                window,
                clientId: board.clientId,
                view: window === "this_week" ? "week" : "list",
              })}
              active={board.window === window}
            >
              {SHOOT_WINDOW_LABEL[window]}
            </FilterChip>
          ))}
        </nav>
        <nav aria-label="Schedule layout" className="flex flex-wrap gap-1.5">
          <FilterChip
            href={shootsHref({ window: board.window, clientId: board.clientId, view: "week" })}
            active={board.view === "week"}
          >
            Week
          </FilterChip>
          <FilterChip
            href={shootsHref({ window: board.window, clientId: board.clientId, view: "list" })}
            active={board.view === "list"}
          >
            List
          </FilterChip>
        </nav>
      </div>
      {board.clients.length > 1 ? (
        <nav aria-label="Client" className="mb-6 flex flex-wrap gap-1.5">
          <FilterChip
            href={shootsHref({ window: board.window, view: board.view })}
            active={!board.clientId}
          >
            All clients
          </FilterChip>
          {board.clients.map((client) => (
            <FilterChip
              key={client.id}
              href={shootsHref({ window: board.window, clientId: client.id, view: board.view })}
              active={board.clientId === client.id}
            >
              {client.name}
            </FilterChip>
          ))}
        </nav>
      ) : null}

      {board.totalInStudio === 0 ? (
        <EmptyState
          title="No shoots on the board."
          body="When the studio bridge returns production days, they will fill this week. Nothing is booked from this page."
        />
      ) : board.view === "list" && displayed.length === 0 ? (
        <EmptyState title="No calls in this cut." body="Try another window, or clear the client filter." />
      ) : board.view === "week" ? (
        <>
          <ShootCalendar
            days={board.week}
            rows={weekRows}
            today={board.today}
            selectedId={board.selected?.shoot.id}
            hrefFor={hrefFor}
          />
          {displayed.length === 0 && outsideWeek === 0 ? (
            <div className="mt-6">
              <EmptyState title="No calls in this cut." body="Try another window, or clear the client filter." />
            </div>
          ) : null}
        </>
      ) : (
        <ShootList rows={board.rows} selectedId={board.selected?.shoot.id} hrefFor={hrefFor} />
      )}

      {outsideWeek > 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link
            href={shootsHref({ window: board.window, clientId: board.clientId, view: "list" })}
            scroll={false}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {outsideWeek} more {outsideWeek === 1 ? "call sits" : "calls sit"} outside this week.
          </Link>
        </p>
      ) : null}

      <p className="mt-3 text-xs text-muted-foreground tabular-nums">
        {displayed.length} {displayed.length === 1 ? "call" : "calls"} in this view
      </p>

      {board.selected ? (
        <ShootDrawer
          closeHref={hrefFor()}
          title={board.selected.shoot.title}
          description={`${board.selected.clientName}, ${board.selected.projectName}`}
        >
          <CallSheet row={board.selected} />
        </ShootDrawer>
      ) : null}
      {board.missingShoot ? (
        <ShootDrawer closeHref={hrefFor()} title="Missing shoot" description="That shoot is not on the board.">
          <p className="font-display text-3xl tracking-tight">That shoot is not on the board.</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The link may be old. The schedule behind this panel is unchanged.
          </p>
        </ShootDrawer>
      ) : null}
    </>
  );
}

function shootsHref(input: {
  window: ShootWindow;
  clientId?: string;
  view: ScheduleView;
  shootId?: string;
}): string {
  const params = new URLSearchParams();
  if (input.window !== "this_week") params.set("window", input.window);
  if (input.clientId) params.set("client", input.clientId);
  const defaultView: ScheduleView = input.window === "this_week" ? "week" : "list";
  if (input.view !== defaultView) params.set("view", input.view);
  if (input.shootId) params.set("shoot", input.shootId);
  const text = params.toString();
  return text ? `/shoots?${text}` : "/shoots";
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
