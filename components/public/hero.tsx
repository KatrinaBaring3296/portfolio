import { ArrowRight, CalendarDays, Download, Flower2 } from "lucide-react";
import type { AvailabilityStatus, FocusProfile, ServiceCategory, SiteSettings } from "@/lib/types";
import { Icon } from "./icon";
import { LocalTime } from "./local-time";
import { SiteImage } from "./site-image";

const STATUS_DOT: Record<AvailabilityStatus, string> = {
  available: "bg-emerald-500",
  limited: "bg-amber-500",
  booked: "bg-stone-400",
};

// Layout: text on the left, the photo on the right inside a thin outlined arch,
// and a full-width pink band along the bottom listing the profile's main
// service categories. On wide screens the photo overlaps the band.
export function Hero({
  settings,
  profile,
  highlights,
}: {
  settings: SiteSettings;
  profile: FocusProfile;
  highlights: ServiceCategory[]; // up to 3, the profile's highlighted ones first
}) {
  const status = settings.availability_status ?? "available";
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-linear-to-b from-primary-tint to-background"
    >
      {/* Soft pink glow drifting slowly behind the photo (decoration only) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] -z-10 size-112 animate-drift rounded-full bg-accent/25 blur-3xl dark:bg-accent/10"
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-20">
        {/* No fade-in here: the hero is the first thing visitors see, so it shows
            immediately (fading it in made the page feel slower and hurt its speed score).
            The bottom padding keeps the text clear of the pink band on wide screens. */}
        <div className="md:pb-40">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-sm font-semibold text-primary-dark shadow-sm shadow-primary/15">
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
          <p className="mt-6 text-lg font-semibold">
            Hi, I&apos;m {settings.name.split(" ")[0]}! <span aria-hidden>👋</span>
            <span className="mx-2 text-primary" aria-hidden>
              ·
            </span>
            <span className="text-muted">{profile.label}</span>
          </p>
          <h1 id="hero-title" className="mt-3 text-4xl leading-tight text-balance lg:text-5xl">
            {profile.headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-pretty text-muted">{profile.pitch}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold tracking-wide text-primary-foreground uppercase transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40"
            >
              Hire me{" "}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
            {settings.booking_url && (
              <a
                href={settings.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-sm font-bold tracking-wide text-primary-dark uppercase transition hover:-translate-y-0.5 hover:bg-surface"
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
                className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-surface px-6 py-3 text-sm font-bold tracking-wide uppercase transition hover:border-primary"
              >
                <Download className="size-4" aria-hidden /> Résumé
              </a>
            ) : (
              // No résumé uploaded for this profile yet
              <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border-2 border-dashed border-border px-6 py-3 text-sm font-bold tracking-wide text-muted uppercase">
                <Download className="size-4" aria-hidden /> Résumé soon
              </span>
            )}
          </div>

          <LocalTime className="mt-6" />
        </div>

        {/* Photo inside a thin pink arch outline, sitting on the band */}
        <div className="relative z-10 mx-auto w-full max-w-sm self-end pt-6">
          <div
            className="absolute -inset-x-5 top-0 bottom-0 rounded-t-[14rem] border-2 border-accent"
            aria-hidden
          />
          <Flower2
            className="absolute top-12 -left-9 size-14 animate-[spin_24s_linear_infinite] text-accent"
            aria-hidden
          />
          <SiteImage
            src={settings.photo_url}
            alt={settings.name}
            sizes="(min-width: 768px) 384px, 90vw"
            priority
            variant="photo"
            placeholderLabel="Your photo"
            className="relative aspect-4/5 rounded-t-[12rem]"
          />
        </div>
      </div>

      {/* The pink band (behind the photo's lower part on wide screens) */}
      {highlights.length > 0 && (
        <div className="bg-primary text-primary-foreground md:absolute md:inset-x-0 md:bottom-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ul className="grid grid-cols-3 gap-4 py-6 md:w-[55%] md:py-8">
              {highlights.map((category) => (
                <li key={category.id} className="flex flex-col items-center gap-2 text-center">
                  <Icon name={category.icon} className="size-8 stroke-[1.5]" />
                  <span className="text-sm leading-tight font-semibold">{category.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
