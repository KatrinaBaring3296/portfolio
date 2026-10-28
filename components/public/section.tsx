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
          <p className="font-mono text-xs font-medium tracking-widest text-primary-dark uppercase">
            {eyebrow}
          </p>
          <h2 id={`${id}-title`} className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {intro && <p className="mt-3 max-w-2xl text-muted">{intro}</p>}
        </Reveal>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
