import { ArrowLeft, ExternalLink, FileText, Maximize2, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TechTag } from "@/components/public/badges";
import { Markdown } from "@/components/public/markdown";
import { getSample, getSampleSlugs, getSettings } from "@/lib/content";
import { sampleMetadata } from "@/lib/seo";
import type { SampleItem } from "@/lib/types";

// Pre-builds each sample page. Cache Components needs at least one entry, so with
// no samples yet we return a placeholder slug (it just shows "not found").
// Samples added later are built on their first visit.
export async function generateStaticParams() {
  const slugs = await getSampleSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/samples/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [sample, settings] = await Promise.all([getSample(slug), getSettings()]);
  if (!sample) return {};
  return sampleMetadata(sample, settings);
}

export default async function SamplePage({ params }: PageProps<"/samples/[slug]">) {
  const { slug } = await params;
  const sample = await getSample(slug);
  if (!sample) notFound();

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/#samples"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary-dark hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to sample work
      </Link>

      <h1 className="mt-6 text-4xl text-balance sm:text-5xl">{sample.title}</h1>
      {sample.result && (
        <div className="mt-6 flex max-w-3xl gap-3 rounded-2xl border border-primary/30 bg-primary-tint p-4">
          <TrendingUp className="mt-0.5 size-5 shrink-0 text-primary-dark" aria-hidden />
          <p>
            <span className="block text-xs font-bold tracking-widest text-primary-dark uppercase">
              Result
            </span>
            <span className="mt-1 block text-lg font-semibold">{sample.result}</span>
          </p>
        </div>
      )}
      {sample.summary && <p className="mt-4 text-lg text-muted">{sample.summary}</p>}
      {sample.tools.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tools used">
          {sample.tools.map((tool) => (
            <li key={tool}>
              <TechTag>{tool}</TechTag>
            </li>
          ))}
        </ul>
      )}

      {sample.description && (
        <div className="mt-10 max-w-3xl">
          <Markdown>{sample.description}</Markdown>
        </div>
      )}

      {sample.items.length > 0 && (
        <section aria-labelledby="files-title" className="mt-14">
          <h2 id="files-title" className="text-2xl">
            The work
          </h2>
          <ol className="mt-6 space-y-10">
            {sample.items.map((item, i) => (
              <li key={item.url} className="grid items-start gap-5 md:grid-cols-[3fr_2fr]">
                {item.kind === "image" ? (
                  <PhotoItem item={item} alt={`${sample.title}, file ${i + 1}`} />
                ) : (
                  <PdfItem item={item} />
                )}
                <div>
                  <p className="font-mono text-xs font-medium tracking-widest text-primary-dark uppercase">
                    {i + 1} of {sample.items.length}
                  </p>
                  {item.caption ? (
                    <p className="mt-2 leading-relaxed whitespace-pre-line">{item.caption}</p>
                  ) : (
                    item.kind === "pdf" &&
                    item.name && <p className="mt-2 break-all text-muted">{item.name}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

// A photo shown whole (not cropped); clicking opens it full size in a new tab
function PhotoItem({ item, alt }: { item: SampleItem; alt: string }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-4/3 overflow-hidden rounded-3xl border border-border bg-primary-tint"
    >
      <Image
        src={item.url}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 560px, 100vw"
        className="object-contain"
      />
      <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-semibold opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        <Maximize2 className="size-3.5" aria-hidden /> Full size
      </span>
    </a>
  );
}

// A PDF: an inline preview on bigger screens (phones open it instead)
function PdfItem({ item }: { item: SampleItem }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface">
      <iframe
        src={`${item.url}#view=FitH`}
        title={item.name || "PDF sample"}
        loading="lazy"
        className="hidden h-128 w-full bg-primary-tint md:block"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium">
          <FileText className="size-5 shrink-0 text-primary-dark" aria-hidden />
          <span className="truncate">{item.name || "PDF document"}</span>
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-primary-tint"
        >
          Open PDF <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}
