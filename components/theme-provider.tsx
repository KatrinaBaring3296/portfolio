"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Follows the visitor's system setting by default; the toggle can override it.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
