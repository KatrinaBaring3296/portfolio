import { type Experience as ExperienceItem, type ExperienceCategory, experienceProof } from "@/lib/types";
import { ProofViewer } from "./proof-viewer";
import { Reveal } from "./reveal";
import { Section } from "./section";

const CATEGORY_LABELS: Record<ExperienceCategory, string> = {
  va: "Virtual assistance",
  teaching: "Teaching",
  business: "Business",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2025-06-01" -> "Jun 2025". Done by hand to avoid time-zone surprises.
function formatMonth(date: string) {
  const [year, month] = date.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function Experience({ items, tinted }: { items: ExperienceItem[]; tinted: boolean }) {
  if (items.length === 0) return null;

  return (
    <Section id="experience" eyebrow="Experience" title="Where I've worked" tinted={tinted}>
      {/* Vertical timeline: a line on the left with a dot per entry */}
      <ol className="relative ml-2 space-y-10 pl-8">
        {/* Gray base line, with a brand-color line that "draws" down over it as
            you scroll (globals.css .timeline-draw; just gray if unsupported) */}
        <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-border" />
        <span aria-hidden className="timeline-draw absolute inset-y-0 left-0 w-0.5 bg-primary" />
        {items.map((item, i) => (
          <li key={item.id} className="relative">
            <span
              className="absolute top-1.5 -left-9.75 size-4 rounded-full border-4 border-background bg-primary"
              aria-hidden
            />
            <Reveal delay={Math.min(i, 3) * 80}>
              <p className="font-mono text-xs text-muted">
                {formatMonth(item.start_date)} – {item.end_date ? formatMonth(item.end_date) : "Present"}
                <span className="mx-2" aria-hidden>
                  ·
                </span>
                {CATEGORY_LABELS[item.category]}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{item.role}</h3>
              <p className="font-medium text-primary-dark">{item.organization}</p>
              <p className="mt-2 max-w-2xl text-muted">{item.description}</p>
              {experienceProof(item).length > 0 && (
                <ProofViewer items={experienceProof(item)} title={`${item.role}, ${item.organization}`} />
              )}
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
