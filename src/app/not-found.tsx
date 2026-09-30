import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg">
      <p className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">Missing</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">That record is not on the floor.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The client or project id does not match the studio data this console can see.
      </p>
      <Link href="/" className="mt-6 inline-flex text-sm underline-offset-4 hover:underline">
        Back to the dashboard
      </Link>
    </div>
  );
}
