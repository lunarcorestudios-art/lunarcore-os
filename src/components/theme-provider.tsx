"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect } from "react";

function ApplyThemeClass() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [pathname, resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <ApplyThemeClass />
      {children}
    </NextThemesProvider>
  );
}
