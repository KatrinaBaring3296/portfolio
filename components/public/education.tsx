import { FileText, GraduationCap } from "lucide-react";
import { type Education as EducationItem, educationYears } from "@/lib/types";
import { ProofViewer } from "./proof-viewer";
import { Reveal } from "./reveal";
import { Section } from "./section";

// Schools, strands, and degrees as cards, in the order set in admin.
export function Education({ items, tinted }: { items: EducationItem[]; tinted: boolean }) {
  if (items.length === 0) return null;

  return (
    <Section id="education" eyebrow="Education" title="Where I studied" tinted={tinted}>
      <ul className="grid gap-6 md:grid-cols-2">
        {items.map((item, i) => {
          const years = educationYears(item);
          const files = item.files ?? [];
          const photos = files.filter((f) => f.kind === "image");
          const pdfs = files.filter((f) => f.kind === "pdf");
          return (
            <li key={item.id}>
              <Reveal delay={(i % 2) * 120} className="h-full">
                <div className="flex h-full gap-4 rounded-2xl border border-border bg-surface p-6">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
                    <GraduationCap className="size-6" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    {years && <p className="font-mono text-xs text-muted">{years}</p>}
                    <h3 className="mt-1 text-lg font-semibold">{item.program}</h3>
                    <p className="font-medium text-primary-dark">{item.school}</p>
                    {item.location && <p className="text-sm text-muted">{item.location}</p>}
                    {item.details && (
                      <p className="mt-3 leading-relaxed whitespace-pre-line text-muted">{item.details}</p>
                    )}
                    {photos.length > 0 && (
                      <ProofViewer
                        items={photos.map(({ url, caption }) => ({ url, caption }))}
                        title={`${item.program}, ${item.school}`}
                        label="View diploma"
                        eyebrow="Education"
                        note="Watermarked preview copy, shared to confirm this education."
                      />
                    )}
                    {pdfs.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {pdfs.map((pdf) => (
                          <li key={pdf.url}>
                            <a
                              href={pdf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={pdf.caption || undefined}
                              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-primary-dark transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary-tint"
                            >
                              <FileText className="size-3.5 shrink-0" aria-hidden />
                              <span className="truncate">{pdf.name || "View PDF"}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
