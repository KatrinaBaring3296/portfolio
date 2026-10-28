import { Reveal } from "./reveal";

// Shared wrapper for homepage sections: anchor id, spacing, and heading.
// `tinted` gives the section the soft brand-color background.
export function Section({
  id,
  eyebrow,
  title,
  intro,
  tinted = false,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  tinted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`scroll-mt-20 py-20 sm:py-24 ${tinted ? "bg-primary-tint" : ""}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          {/* Small pill label above each heading (white on peach sections, peach elsewhere) */}
          <p
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wider text-primary-dark uppercase ${
              tinted ? "bg-surface" : "bg-primary-tint"
            }`}
          >
            {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="mt-3 text-3xl font-semibold sm:text-4xl">
            {title}
          </h2>
          {intro && <p className="mt-3 max-w-2xl text-muted">{intro}</p>}
        </Reveal>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
