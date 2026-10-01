import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
