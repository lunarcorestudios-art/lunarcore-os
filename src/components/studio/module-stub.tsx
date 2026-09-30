import { EmptyState } from "@/components/studio/empty-state";
import { PageHeader } from "@/components/studio/page-header";

export function ComingOnline({ adapter }: { adapter: string }) {
  return (
    <p className="rounded-full border border-border bg-card px-3 py-1.5 text-xs tracking-wide text-muted-foreground">
      Coming online · {adapter}
    </p>
  );
}

export function ModuleStub({
  kicker,
  title,
  purpose,
  adapter,
  children,
}: {
  kicker: string;
  title: string;
  purpose: string;
  adapter: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader kicker={kicker} title={title} lede={purpose} actions={<ComingOnline adapter={adapter} />} />
      {children}
    </>
  );
}

export function StubMetrics({ items }: { items: readonly { label: string; hint: string }[] }) {
  const columns =
    items.length >= 4 ? "sm:grid-cols-4" : items.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <dl className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border ${columns}`}>
      {items.map((item) => (
        <div key={item.label} className="bg-card px-4 py-4 sm:px-5">
          <dt className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">{item.label}</dt>
          <dd className="mt-2 font-display text-4xl tracking-tight text-muted-foreground">—</dd>
          <dd className="mt-1 text-xs text-muted-foreground">{item.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StubTable({
  columns,
  emptyTitle,
  emptyBody,
}: {
  columns: readonly string[];
  emptyTitle: string;
  emptyBody: string;
}) {
  return (
    <div>
      <div
        className="mb-3 hidden gap-4 px-1 text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase sm:grid"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <EmptyState title={emptyTitle} body={emptyBody} />
    </div>
  );
}

export function StubBoard({ columns }: { columns: readonly { label: string; detail: string }[] }) {
  const wide = columns.length > 4 ? "lg:grid-cols-7" : "lg:grid-cols-4";
  return (
    <ul className={`grid grid-cols-2 gap-3 sm:grid-cols-2 ${wide}`}>
      {columns.map((column) => (
        <li key={column.label} className="min-h-36 rounded-lg border border-border bg-card px-4 py-4">
          <p className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">{column.label}</p>
          <p className="mt-8 font-display text-3xl tracking-tight text-muted-foreground">—</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{column.detail}</p>
        </li>
      ))}
    </ul>
  );
}
