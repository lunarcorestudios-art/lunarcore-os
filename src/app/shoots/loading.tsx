export default function ShootSchedulesLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full bg-muted" />
        <div className="h-12 w-2/3 max-w-md rounded-md bg-muted" />
        <div className="h-4 w-1/2 max-w-sm rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="h-40 bg-card" />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Loading the schedule…</p>
    </div>
  );
}
