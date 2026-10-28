import { Analytics } from "@vercel/analytics/next";
import { ViewTransition } from "react";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsAppButton, whatsappLink } from "@/components/public/whatsapp-button";
import { brandLogoPath } from "@/lib/brand-icons";
import { getSettings } from "@/lib/content";

// Header and footer around every public page (the admin panel gets its own layout).
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  // Floating WhatsApp button, if a WhatsApp link is in your social links
  const whatsapp = whatsappLink(settings.social_links, settings.name.split(" ")[0] || settings.name);
  const whatsappLogo = brandLogoPath("whatsapp");

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      {/* Thin bar at the top that fills as you scroll (pure CSS, see globals.css) */}
      <div className="scroll-progress" aria-hidden />
      <SiteHeader name={settings.name} />
      <main id="main">
        {/* Crossfades the page content when moving between pages
            (e.g. homepage -> project page). Unsupported browsers just switch. */}
        <ViewTransition>{children}</ViewTransition>
      </main>
      <SiteFooter settings={settings} />
      {whatsapp && whatsappLogo && <WhatsAppButton url={whatsapp} logoPath={whatsappLogo} />}
      {/* Visitor stats (Vercel Web Analytics: no cookies, free plan). Only on
          public pages, so your own admin visits aren't counted. */}
      <Analytics />
    </>
  );
}
