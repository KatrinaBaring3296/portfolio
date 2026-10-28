import { Clock, Flower2, MapPin, MessageCircleHeart } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { Reveal } from "./reveal";

// Unlike the other sections, About has its heading on the left (next to the
// text) and a pink arch-shaped card with quick facts on the right.
export function About({ settings, tinted }: { settings: SiteSettings; tinted: boolean }) {
  // Blank lines in the about text become separate paragraphs.
  const paragraphs = settings.about.split(/\n\s*\n/);

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className={`scroll-mt-20 py-20 sm:py-24 ${tinted ? "bg-primary-tint" : ""}`}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.2em] text-muted uppercase">About</p>
          <h2 id="about-title" className="mt-2 text-3xl sm:text-4xl">
            A bit about me
          </h2>
          <div className="mt-4 flex items-center gap-3 text-accent" aria-hidden>
            <span className="h-px w-12 bg-accent" />
            <Flower2 className="size-5" />
          </div>
          <div className="mt-6 space-y-4 text-lg leading-relaxed">
            {paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="relative mx-auto max-w-xs">
            {/* Thin outline arch offset behind the card, like the hero photo */}
            <div
              className="absolute inset-0 translate-x-4 -translate-y-4 rounded-t-[10rem] rounded-b-3xl border-2 border-accent"
              aria-hidden
            />
            <div className="relative flex flex-col items-center gap-6 rounded-t-[10rem] rounded-b-3xl bg-primary px-8 pt-16 pb-10 text-center text-primary-foreground">
              <MessageCircleHeart className="size-12 stroke-[1.5]" aria-hidden />
              <ul className="space-y-4 text-sm font-semibold">
                <li className="flex flex-col items-center gap-1">
                  <MapPin className="size-5" aria-hidden />
                  Based in the Philippines (UTC+8)
                </li>
                <li className="flex flex-col items-center gap-1">
                  <Clock className="size-5" aria-hidden />
                  {settings.reply_time_text}
                </li>
              </ul>
              <a
                href="#contact"
                className="rounded-full bg-surface px-6 py-2.5 text-sm font-bold tracking-wide text-primary-dark uppercase transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Say hello
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
