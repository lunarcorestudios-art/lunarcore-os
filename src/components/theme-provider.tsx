"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useSyncExternalStore } from "react";

const THEMES = ["daylight", "charcoal"] as const;

function subscribeToHydration() {
  return () => {};
}

function hydratedOnClient() {
  return true;
}

function hydratedOnServer() {
  return false;
}

/** Daylight until hydration, then the stored Daylight or Charcoal choice. */
export function useStudioTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribeToHydration, hydratedOnClient, hydratedOnServer);
  const theme =
    hydrated && (resolvedTheme === "daylight" || resolvedTheme === "charcoal") ? resolvedTheme : "daylight";
  return { theme, setTheme };
}

function ApplyThemeClass() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "daylight" && resolvedTheme !== "charcoal") return;
    const root = document.documentElement;
    root.classList.remove("daylight", "charcoal", "light", "dark");
    root.classList.add(resolvedTheme);
  }, [pathname, resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="daylight"
      enableSystem={false}
      enableColorScheme={false}
      themes={[...THEMES]}
      storageKey="lunarcore-theme"
      disableTransitionOnChange
    >
      <ApplyThemeClass />
      {children}
    </NextThemesProvider>
  );
}
