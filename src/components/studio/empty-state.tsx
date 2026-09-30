export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 shadow-[var(--shadow)]">
      <p className="font-display text-xl font-semibold tracking-tight">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
