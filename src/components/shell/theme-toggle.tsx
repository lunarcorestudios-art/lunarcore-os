"use client";

import { useStudioTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { id: "daylight", label: "Daylight" },
  { id: "charcoal", label: "Charcoal" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useStudioTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex shrink-0 rounded-full border border-border bg-muted p-0.5"
    >
      {OPTIONS.map((option) => {
        const selected = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => setTheme(option.id)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors sm:px-3",
              selected
                ? "bg-card text-foreground shadow-[var(--shadow)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
