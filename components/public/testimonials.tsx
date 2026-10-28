import { Quote } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { Reveal } from "./reveal";
import { Section } from "./section";

// Hidden entirely until there's at least one testimonial.
export function Testimonials({ items, tinted }: { items: Testimonial[]; tinted: boolean }) {
  if (items.length === 0) return null;

  return (
    <Section id="testimonials" eyebrow="Testimonials" title="What people say" tinted={tinted}>
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((t, i) => (
          <li key={t.id}>
            <Reveal delay={i * 80} className="h-full">
              <figure className="h-full rounded-3xl border border-border bg-surface p-6">
                <Quote className="size-6 text-primary" aria-hidden />
                <blockquote className="mt-3 text-lg leading-relaxed">{t.quote}</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted"> · {t.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
