"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg">
      <p className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">Studio console</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">The floor did not load.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {error.message || "Something went wrong while reading studio data."}
      </p>
      <Button type="button" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
