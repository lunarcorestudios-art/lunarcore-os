import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/shell/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { loadShell } from "@/lib/studio/view";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lunarcore OS",
    template: "%s · Lunarcore OS",
  },
  description: "Internal studio console for Lunarcore Studios. Clients, delivery, and the health of the floor.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const shell = await loadShell();

  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
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
