import { ArrowRight, CalendarDays, Download, Heart, Sparkles } from "lucide-react";
import type { AvailabilityStatus, FocusProfile, SiteSettings } from "@/lib/types";
import { LocalTime } from "./local-time";
import { SiteImage } from "./site-image";

const STATUS_DOT: Record<AvailabilityStatus, string> = {
  available: "bg-emerald-500",
  limited: "bg-amber-500",
  booked: "bg-stone-400",
};

export function Hero({ settings, profile }: { settings: SiteSettings; profile: FocusProfile }) {
  const status = settings.availability_status ?? "available";
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* Soft coral and peach glows drifting slowly behind the hero (decoration only) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-[-10%] size-112 animate-drift rounded-full bg-primary/20 blur-3xl dark:bg-primary/10" />
        <div className="absolute bottom-[-30%] left-[-15%] size-96 animate-drift-slow rounded-full bg-accent/25 blur-3xl dark:bg-accent/[0.08]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-[1.3fr_1fr]">
        {/* No fade-in here: the hero is the first thing visitors see, so it shows
            immediately (fading it in made the page feel slower and hurt its speed score). */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold text-primary-dark shadow-sm shadow-primary/20">
            {/* Status light: green and pulsing when available, amber when limited,
                gray when booked (set in Admin > Site settings) */}
            <span className="relative flex size-2" aria-hidden>
              {status === "available" && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              )}
              <span className={`relative inline-flex size-2 rounded-full ${STATUS_DOT[status]}`} />
            </span>
            {settings.availability_text}
          </span>

          {/* A friendly hello, with the first name only */}
          <p className="mt-6 text-lg font-semibold text-muted">
            Hi, I&apos;m {settings.name.split(" ")[0]}! <span aria-hidden>👋</span>
            <span className="mx-2 text-primary" aria-hidden>
              ·
            </span>
            {profile.label}
          </p>
          <h1 id="hero-title" className="mt-2 text-4xl font-semibold text-balance sm:text-5xl">
            {profile.headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-pretty text-muted">{profile.pitch}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40"
            >
              Hire me{" "}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
            {settings.booking_url && (
              <a
                href={settings.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-3 font-semibold text-primary-dark transition hover:-translate-y-0.5 hover:bg-primary-tint"
              >
                <CalendarDays className="size-4" aria-hidden /> Book a call
              </a>
            )}
            {profile.resume_url ? (
              // Goes through /resume/[slug], which counts the download, then opens the PDF
              <a
                href={`/resume/${profile.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 font-semibold transition hover:bg-primary-tint"
              >
                <Download className="size-4" aria-hidden /> Download résumé
              </a>
            ) : (
              // No résumé uploaded for this profile yet
              <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-border px-5 py-3 font-semibold text-muted">
                <Download className="size-4" aria-hidden /> Résumé coming soon
              </span>
            )}
          </div>

          <LocalTime className="mt-6" />
        </div>

        <div className="mx-auto w-full max-w-sm">
          {/* The photo floats up and down slowly. It's visible from the start;
              only its position moves, so it doesn't slow the page down. */}
          <div className="relative animate-float">
            {/* Arch-shaped photo (like a classroom window) on a peach arch,
                with a little heart and sparkle for decoration */}
            <div
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-t-[12rem] rounded-b-[2.5rem] bg-accent/45 dark:bg-accent/20"
              aria-hidden
            />
            <SiteImage
              src={settings.photo_url}
              alt={settings.name}
              sizes="(min-width: 768px) 384px, 90vw"
              priority
              variant="photo"
              placeholderLabel="Your photo"
              className="relative aspect-4/5 rounded-t-[12rem] rounded-b-[2.5rem] border-4 border-surface shadow-xl shadow-primary/20"
            />
            <span
              className="absolute -bottom-3 -left-3 inline-flex size-14 items-center justify-center rounded-full bg-surface text-primary shadow-lg shadow-primary/20"
              aria-hidden
            >
              <Heart className="size-6 fill-primary" />
            </span>
            <Sparkles className="absolute -top-2 right-2 size-8 text-accent" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
