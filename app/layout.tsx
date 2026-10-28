import type { Metadata } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

// Rounded, friendly font for body text and labels
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

// Elegant serif for headings
const playfair = Playfair_Display({
  variable: "--font-playfair",
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
    <html lang="en" className={`${nunito.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
