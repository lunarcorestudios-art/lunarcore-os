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
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-[0.68rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">{kicker}</p>
        <h1 className="mt-2 font-display text-[2.4rem] leading-[1.02] tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {lede ? <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{lede}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
