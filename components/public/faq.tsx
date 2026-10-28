import { ChevronDown } from "lucide-react";
import type { Faq as FaqItem } from "@/lib/types";
import { Reveal } from "./reveal";
import { Section } from "./section";

// Frequently asked questions as an expandable list. Uses the built-in
// <details> element: works without JavaScript and with keyboards/screen readers.
export function Faq({ items, tinted }: { items: FaqItem[]; tinted: boolean }) {
  if (items.length === 0) return null;

  return (
    <Section id="faq" eyebrow="FAQ" title="Questions clients ask" tinted={tinted}>
      <Reveal>
        <ul className="mx-auto max-w-3xl space-y-3">
          {items.map((item, i) => (
            <li key={item.id} className="stagger-child" style={{ "--i": i } as React.CSSProperties}>
              <details className="group rounded-3xl border border-border bg-surface transition-colors open:border-primary">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    className="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="-mt-1 px-5 pb-5 leading-relaxed whitespace-pre-line text-muted">
                  {item.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
