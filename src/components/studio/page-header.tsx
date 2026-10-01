export function PageHeader({
  kicker,
  title,
  lede,
  actions,
}: {
  kicker: string;
  title: string;
  lede?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-medium text-muted-foreground">{kicker}</p>
        <h1 className="mt-1.5 font-display text-[1.75rem] leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        {lede ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{lede}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
