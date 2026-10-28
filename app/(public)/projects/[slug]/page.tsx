import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TechTag } from "@/components/public/badges";
import { Markdown } from "@/components/public/markdown";
import { SiteImage } from "@/components/public/site-image";
import { getProject, getProjectSlugs, getSettings } from "@/lib/content";
import { projectMetadata } from "@/lib/seo";

// Pre-builds each project page. Cache Components needs at least one entry, so with
// no projects yet we return a placeholder slug (it just shows "not found").
// Projects added later are built on their first visit.
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProject(slug), getSettings()]);
  if (!project) return {};
  return projectMetadata(project, settings);
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary-dark hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to projects
      </Link>

      <h1 className="mt-6 text-4xl font-semibold text-balance sm:text-5xl">{project.title}</h1>
      <p className="mt-4 text-lg text-muted">{project.summary}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {project.github_url && <ExternalButton href={project.github_url}>View files</ExternalButton>}
        {project.demo_url && <ExternalButton href={project.demo_url}>View sample</ExternalButton>}
      </div>

      <SiteImage
        src={project.cover_image}
        alt={`${project.title} cover`}
        sizes="(min-width: 896px) 848px, 100vw"
        priority
        placeholderLabel="Cover image"
        className="mt-10 aspect-video rounded-3xl border border-border"
      />

      <div className="mt-10 grid gap-10 md:grid-cols-[2fr_1fr]">
        <Markdown>{project.content}</Markdown>

        {project.tech_stack.length > 0 && (
          <aside>
            <h2 className="font-mono text-xs font-medium tracking-widest text-primary-dark uppercase">
              Tools used
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tech_stack.map((tag) => (
                <li key={tag}>
                  <TechTag>{tag}</TechTag>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {project.gallery.length > 0 && (
        <section aria-labelledby="gallery-title" className="mt-14">
          <h2 id="gallery-title" className="text-2xl font-semibold">
            Gallery
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {project.gallery.map((url, i) => (
              <li key={url}>
                <SiteImage
                  src={url}
                  alt={`${project.title} screenshot ${i + 1}`}
                  sizes="(min-width: 640px) 420px, 100vw"
                  className="aspect-video rounded-3xl border border-border"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function ExternalButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-primary-tint"
    >
      {children} <ExternalLink className="size-4" aria-hidden />
    </a>
  );
}
