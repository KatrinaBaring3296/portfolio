"use client";

import { ExternalLink, Pencil, Plus, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Markdown } from "@/components/public/markdown";
import { type ProjectInput, saveProject } from "@/lib/admin/content-actions";
import { slugify } from "@/lib/admin/slug";
import type { Project } from "@/lib/types";
import { EditorDialog, FormFooter } from "./editor-dialog";
import { FileUpload } from "./file-upload";
import { GalleryEditor } from "./gallery-editor";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { type ProfileOption, ShowForPicker, showForLabel } from "./show-for-picker";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass } from "./ui";

const EMPTY: ProjectInput = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  tech_stack: [],
  cover_image: null,
  gallery: [],
  github_url: "",
  demo_url: "",
  featured: false,
  status: "active",
  show_for: [],
};

// Database rows use null for empty links; the form uses ""
const toInput = (p: Project): ProjectInput => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  summary: p.summary,
  content: p.content,
  tech_stack: p.tech_stack,
  cover_image: p.cover_image,
  gallery: p.gallery,
  github_url: p.github_url ?? "",
  demo_url: p.demo_url ?? "",
  featured: p.featured,
  status: p.status,
  show_for: p.show_for,
});

export function ProjectsManager({ projects, profiles }: { projects: Project[]; profiles: ProfileOption[] }) {
  const [editing, setEditing] = useState<ProjectInput | null>(null);
  const ids = projects.map((p) => p.id);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setEditing(EMPTY)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden /> Add project
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {projects.map((p, i) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-primary-tint">
              {p.cover_image && (
                <Image src={p.cover_image} alt="" fill sizes="80px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold">
                {p.title}
                {p.featured && <Star className="size-4 fill-primary text-primary" aria-label="Featured" />}
              </p>
              <p className="truncate text-xs text-muted">{showForLabel(p.show_for, profiles)}</p>
            </div>
            <a
              href={`/projects/${p.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${p.title} on the site`}
              className={iconButtonClass}
            >
              <ExternalLink className="size-4" aria-hidden />
            </a>
            <StatusSelect table="projects" id={p.id} status={p.status} label={`Status of ${p.title}`} />
            <div className="flex items-center">
              <MoveButtons table="projects" ids={ids} index={i} label={p.title} />
              <button
                type="button"
                onClick={() => setEditing(toInput(p))}
                aria-label={`Edit ${p.title}`}
                className={iconButtonClass}
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <DeleteButton
                table="projects"
                id={p.id}
                label={p.title}
                description="The project page and all its images are deleted."
              />
            </div>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="p-8 text-center text-muted">
            No projects yet. The Projects section stays hidden until you add one.
          </li>
        )}
      </ul>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit project" : "Add project"}
      >
        {editing && <ProjectForm initial={editing} profiles={profiles} onDone={() => setEditing(null)} />}
      </EditorDialog>
    </>
  );
}

function ProjectForm({
  initial,
  profiles,
  onDone,
}: {
  initial: ProjectInput;
  profiles: ProfileOption[];
  onDone: () => void;
}) {
  const [form, setForm] = useState<ProjectInput>(initial);
  // Tech tags are typed as "Canva, Google Slides, Zoom" and split on save
  const [tags, setTags] = useState(initial.tech_stack.join(", "));
  const [preview, setPreview] = useState(false);
  const { run, pending } = useAction();
  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveProject({ ...form, tech_stack: tags.split(",") });
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" htmlFor="pr-title">
          <input
            id="pr-title"
            required
            maxLength={120}
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({ ...f, title, slug: f.id ? f.slug : slugify(title) }));
            }}
            className={inputClass}
          />
        </Field>
        <Field
          label="URL name"
          htmlFor="pr-slug"
          hint={form.id ? "Changing this breaks links you've already shared." : undefined}
        >
          <div className="mt-1.5 flex items-center rounded-lg border border-border bg-background focus-within:border-primary">
            <span className="pl-3 font-mono text-sm text-muted">/projects/</span>
            <input
              id="pr-slug"
              required
              maxLength={60}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase())}
              className="w-full min-w-0 bg-transparent py-2 pr-3 pl-0.5 font-mono text-sm focus:outline-none"
            />
          </div>
        </Field>
      </div>

      <Field label="Summary" htmlFor="pr-summary" hint="One sentence for the project card.">
        <input
          id="pr-summary"
          maxLength={300}
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="pr-content" className="text-sm font-semibold">
            Description
          </label>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-xs font-semibold text-primary-dark hover:underline"
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview ? (
          <div className="mt-1.5 min-h-40 rounded-lg border border-border p-4">
            <Markdown>{form.content || "_Nothing written yet._"}</Markdown>
          </div>
        ) : (
          <textarea
            id="pr-content"
            rows={9}
            maxLength={20000}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
            className={`${inputClass} resize-y font-mono`}
          />
        )}
        <p className="mt-1 text-xs text-muted">
          Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>- list item</code>,{" "}
          <code>[link](https://…)</code>. Leave a blank line between paragraphs.
        </p>
      </div>

      <Field
        label="Tools used"
        htmlFor="pr-tags"
        hint="Separate with commas, e.g. Canva, Google Slides, Zoom"
      >
        <input id="pr-tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Files link" htmlFor="pr-github" hint="Optional.">
          <input
            id="pr-github"
            inputMode="url"
            placeholder="github.com/you/project"
            value={form.github_url}
            onChange={(e) => set("github_url", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Sample link" htmlFor="pr-demo" hint="Optional.">
          <input
            id="pr-demo"
            inputMode="url"
            value={form.demo_url}
            onChange={(e) => set("demo_url", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Cover image"
        hint="Shown on the card and at the top of the project page. 16:9 looks best."
      >
        <FileUpload
          bucket="images"
          folder="projects"
          value={form.cover_image}
          onChange={(url) => set("cover_image", url)}
        />
      </Field>

      <Field label="Gallery" hint="Extra screenshots, shown at the bottom of the project page.">
        <GalleryEditor value={form.gallery} onChange={(urls) => set("gallery", urls)} />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="mt-0.5 size-4 accent-primary"
        />
        <span className="text-sm">
          <span className="font-semibold">Featured</span>
          <span className="block text-xs text-muted">
            Shown as the large card. If several are featured, the highest one in the list wins.
          </span>
        </span>
      </label>

      <ShowForPicker profiles={profiles} value={form.show_for} onChange={(ids) => set("show_for", ids)} />
      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />
      <FormFooter pending={pending} onCancel={onDone} saveLabel={form.id ? "Save project" : "Add project"} />
    </form>
  );
}
