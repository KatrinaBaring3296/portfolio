import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

// Main font for headings and body text
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Monospace font for small tech labels (skill chips, tech-stack tags)
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

// Site-wide defaults. Each public page sets its own title and description
// (see lib/seo.ts); metadataBase turns links like "/for/online-tutor" into full URLs.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Proves to Google Search Console that this site is yours. The code comes
  // from Search Console ("HTML tag" method) and is set in Vercel as
  // GOOGLE_SITE_VERIFICATION. Without it, no tag is added.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  title: "Portfolio",
  description: "Portfolio of a Virtual Assistant and former teacher from the Philippines.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: next-themes adds the "dark" class before React loads
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
