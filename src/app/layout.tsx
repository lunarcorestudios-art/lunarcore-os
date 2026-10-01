import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import { AppShell } from "@/components/shell/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { loadShell } from "@/lib/studio/view";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lunarcore OS",
    template: "%s · Lunarcore OS",
  },
  description: "Internal studio console for Lunarcore Studios. Clients, delivery, and the rest of the floor.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const shell = await loadShell();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider>
          <AppShell actor={shell.actor} workspaceName={shell.workspaceName} caption={shell.caption}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
