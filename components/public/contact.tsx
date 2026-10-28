import { Briefcase, CalendarDays, Clock, ExternalLink, Mail } from "lucide-react";
import { hiringPlatforms, type SiteSettings } from "@/lib/types";
import { ContactForm } from "./contact-form";
import { Reveal } from "./reveal";
import { Section } from "./section";

export function Contact({
  settings,
  profileSlug,
  tinted,
}: {
  settings: SiteSettings;
  profileSlug: string;
  tinted: boolean;
}) {
  // Optional links from Admin > Site settings: "Book a call", then one
  // "Hire me on ..." button per hiring platform, in the order set there
  const platforms = [
    ...(settings.booking_url
      ? [{ label: "Book a call", url: settings.booking_url, Icon: CalendarDays }]
      : []),
    ...hiringPlatforms(settings).map((p) => ({
      label: `Hire me on ${p.label}`,
      url: p.url,
      Icon: Briefcase,
    })),
  ];

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let's work together"
      intro="Tell me a little about what you need, and I'll get back to you."
      tinted={tinted}
    >
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <ContactForm profileSlug={profileSlug} />
        </Reveal>

        <Reveal delay={100} className="space-y-6">
          <p className="flex items-center gap-3 text-sm">
            <Clock className="size-5 text-primary" aria-hidden />
            {settings.reply_time_text}
          </p>
          {platforms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold">Prefer a hiring platform or a call?</h3>
              <ul className="mt-2 space-y-2">
                {platforms.map(({ label, url, Icon }) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/10"
                    >
                      <Icon className="size-4 text-primary" aria-hidden />
                      <span className="flex-1">{label}</span>
                      <ExternalLink
                        className="size-3.5 text-muted transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold">Email</h3>
            <a
              href={`mailto:${settings.email}`}
              className="mt-1 inline-flex items-center gap-2 font-medium break-all text-primary-dark underline-offset-4 hover:underline"
            >
              <Mail className="size-4 shrink-0" aria-hidden />
              {settings.email}
            </a>
          </div>
          {settings.social_links.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold">Elsewhere</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {settings.social_links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary"
                    >
                      {link.label}
                      <ExternalLink className="size-3.5 text-muted" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
