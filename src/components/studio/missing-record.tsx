import Link from "next/link";

export function MissingRecord({ kind }: { kind: "client" | "project" }) {
  const back = kind === "client" ? "/clients" : "/delivery";
  const label = kind === "client" ? "Clients" : "Delivery";
  return (
    <div className="max-w-lg">
      <p className="text-xs font-medium text-muted-foreground">Missing</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        That {kind} is not on the floor.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The id does not match the studio data this console can see.
      </p>
      <Link href={back} className="mt-6 inline-flex text-sm font-medium text-accent underline-offset-4 hover:underline">
        Back to {label}
      </Link>
    </div>
  );
}
