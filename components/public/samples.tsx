import { ArrowRight, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { sampleItemCount, type WorkSample } from "@/lib/types";
import { TechTag } from "./badges";
import { Reveal } from "./reveal";
import { Section } from "./section";
import { SiteImage } from "./site-image";

// Homepage "Sample Work" cards; each opens its own page at /samples/<slug>.
export function Samples({ items, tinted }: { items: WorkSample[]; tinted: boolean }) {
  if (items.length === 0) return null;

  return (
    <Section id="samples" eyebrow="Sample work" title="Examples of my work" tinted={tinted}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((sample, i) => {
          const cover = sample.items.find((item) => item.kind === "image");
          return (
            <li key={sample.id}>
              {/* Cards in the same row cascade in left to right */}
              <Reveal delay={(i % 3) * 120} className="h-full">
                <Link
                  href={`/samples/${sample.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface transition hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                >
                  {cover ? (
                    <SiteImage
                      src={cover.url}
                      alt=""
                      sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
                      className="aspect-video"
                      imageClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    // PDF-only samples get a document icon instead of a photo
                    <div className="flex aspect-video items-center justify-center bg-primary-tint text-primary-dark">
                      <FileText className="size-12 stroke-[1.5]" aria-hidden />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold">{sample.title}</h3>
                    {sample.result && (
                      <p className="mt-2 flex gap-1.5 text-sm font-semibold text-primary-dark">
                        <TrendingUp className="mt-0.5 size-4 shrink-0" aria-hidden />
                        <span>
                          <span className="sr-only">Result: </span>
                          {sample.result}
                        </span>
                      </p>
                    )}
                    {sample.summary && <p className="mt-1 text-sm text-muted">{sample.summary}</p>}
                    {sample.tools.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tools used">
                        {sample.tools.map((tool) => (
                          <li key={tool}>
                            <TechTag>{tool}</TechTag>
                          </li>
                        ))}
                      </ul>
                    )}
                    <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
                      <span className="text-muted">{sampleItemCount(sample.items)}</span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-primary-dark">
                        View sample
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1"
                          aria-hidden
                        />
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
