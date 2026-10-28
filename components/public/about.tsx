import { Clock, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { Reveal } from "./reveal";
import { Section } from "./section";

export function About({ settings, tinted }: { settings: SiteSettings; tinted: boolean }) {
  // Blank lines in the about text become separate paragraphs.
  const paragraphs = settings.about.split(/\n\s*\n/);

  return (
    <Section id="about" eyebrow="About" title="A bit about me" tinted={tinted}>
      <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
        <Reveal className="space-y-4 text-lg leading-relaxed">
          {paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </Reveal>
        <Reveal delay={100}>
          <ul className="space-y-3 rounded-2xl border border-border bg-surface p-6 text-sm">
            <li className="flex items-center gap-3">
              <MapPin className="size-5 text-primary" aria-hidden />
              Based in the Philippines (UTC+8)
            </li>
            <li className="flex items-center gap-3">
              <Clock className="size-5 text-primary" aria-hidden />
              {settings.reply_time_text}
            </li>
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
