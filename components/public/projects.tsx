import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/types";
import { TechTag } from "./badges";
import { SiteImage } from "./site-image";
import { Reveal } from "./reveal";
import { Section } from "./section";

export function Projects({ items, tinted }: { items: Project[]; tinted: boolean }) {
  if (items.length === 0) return null;

  // The first featured project gets the large card; the rest go in the grid.
  const featured = items.find((p) => p.featured);
  const others = items.filter((p) => p !== featured);

  return (
    <Section id="projects" eyebrow="Work samples" title="Things I've made" tinted={tinted}>
      {featured && (
        <Reveal>
          <Link
            href={`/projects/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-border bg-surface transition hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 md:grid-cols-2"
          >
            <SiteImage
              src={featured.cover_image}
              alt=""
              sizes="(min-width: 1152px) 552px, (min-width: 768px) 50vw, 100vw"
              placeholderLabel="Cover image"
              className="aspect-video md:aspect-auto md:h-full md:min-h-72"
              imageClassName="transition-transform duration-500 group-hover:scale-105"
            />
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <p className="font-mono text-xs font-medium tracking-widest text-primary-dark uppercase">
                Featured
              </p>
              <h3 className="mt-2 text-2xl font-bold">{featured.title}</h3>
              <p className="mt-3 text-muted">{featured.summary}</p>
              <TagList tags={featured.tech_stack} />
              <span className="mt-6 inline-flex items-center gap-2 font-semibold text-primary-dark">
                View project
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </Link>
        </Reveal>
      )}

      {others.length > 0 && (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((project, i) => (
            <li key={project.id}>
              {/* Cards in the same row cascade in left to right */}
              <Reveal delay={(i % 3) * 120} className="h-full">
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                >
                  <SiteImage
                    src={project.cover_image}
                    alt=""
                    sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
                    placeholderLabel="Cover image"
                    className="aspect-video"
                    imageClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="mt-1 text-sm text-muted">{project.summary}</p>
                    <TagList tags={project.tech_stack} />
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tools used">
      {tags.map((tag) => (
        <li key={tag}>
          <TechTag>{tag}</TechTag>
        </li>
      ))}
    </ul>
  );
}
