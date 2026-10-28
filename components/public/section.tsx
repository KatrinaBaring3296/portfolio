import { Flower2 } from "lucide-react";
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
        {/* Centered heading: small label, pink serif title, then a little flower divider */}
        <Reveal className="text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-muted uppercase">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-2 text-3xl sm:text-4xl">
            {title}
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3 text-accent" aria-hidden>
            <span className="h-px w-12 bg-accent" />
            <Flower2 className="size-5" />
            <span className="h-px w-12 bg-accent" />
          </div>
          {intro && <p className="mx-auto mt-4 max-w-2xl text-muted">{intro}</p>}
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
