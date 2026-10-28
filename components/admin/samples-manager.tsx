"use client";

import { ExternalLink, FileText, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Markdown } from "@/components/public/markdown";
import { type SampleInput, saveSample } from "@/lib/admin/content-actions";
import { slugify } from "@/lib/admin/slug";
import { sampleItemCount, type WorkSample } from "@/lib/types";
import { EditorDialog, FormFooter } from "./editor-dialog";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { SampleItemsEditor } from "./sample-items-editor";
import { type ProfileOption, ShowForPicker, showForLabel } from "./show-for-picker";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass } from "./ui";

const EMPTY: SampleInput = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  tools: [],
  items: [],
  status: "active",
  show_for: [],
};

const toInput = (s: WorkSample): SampleInput => ({
  id: s.id,
  title: s.title,
  slug: s.slug,
  summary: s.summary,
  description: s.description,
  tools: s.tools,
  items: s.items,
  status: s.status,
  show_for: s.show_for,
});

export function SamplesManager({
  samples,
  profiles,
  ownerName,
  tableMissing,
}: {
  samples: WorkSample[];
  profiles: ProfileOption[];
  ownerName: string; // stamped on watermarked photos
  tableMissing: boolean;
}) {
  const [editing, setEditing] = useState<SampleInput | null>(null);
  const ids = samples.map((s) => s.id);

  if (tableMissing) {
    return (
      <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        One-time setup needed: run <code className="font-mono">supabase/updates/0010_work_samples.sql</code>{" "}
        in the Supabase SQL Editor, then refresh this page.
      </p>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setEditing(EMPTY)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden /> Add sample
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {samples.map((s, i) => {
          const cover = s.items.find((item) => item.kind === "image");
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="relative flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-primary-tint text-primary-dark">
                {cover ? (
                  <Image src={cover.url} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <FileText className="size-5" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{s.title}</p>
                <p className="truncate text-xs text-muted">
                  {sampleItemCount(s.items) || "No files yet"} · {showForLabel(s.show_for, profiles)}
                </p>
              </div>
              <a
                href={`/samples/${s.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${s.title} on the site`}
                className={iconButtonClass}
              >
                <ExternalLink className="size-4" aria-hidden />
              </a>
              <StatusSelect table="work_samples" id={s.id} status={s.status} label={`Status of ${s.title}`} />
              <div className="flex items-center">
                <MoveButtons table="work_samples" ids={ids} index={i} label={s.title} />
                <button
                  type="button"
                  onClick={() => setEditing(toInput(s))}
                  aria-label={`Edit ${s.title}`}
                  className={iconButtonClass}
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <DeleteButton
                  table="work_samples"
                  id={s.id}
                  label={s.title}
                  description="The sample page and all its photos and PDFs are deleted."
                />
              </div>
            </li>
          );
        })}
        {samples.length === 0 && (
          <li className="p-8 text-center text-muted">
            No samples yet. The Sample Work section stays hidden until you add one.
          </li>
        )}
      </ul>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit sample" : "Add sample"}
      >
        {editing && (
          <SampleForm
            initial={editing}
            profiles={profiles}
            ownerName={ownerName}
            onDone={() => setEditing(null)}
          />
        )}
      </EditorDialog>
    </>
  );
}

function SampleForm({
  initial,
  profiles,
  ownerName,
  onDone,
}: {
  initial: SampleInput;
  profiles: ProfileOption[];
  ownerName: string;
  onDone: () => void;
}) {
  const [form, setForm] = useState<SampleInput>(initial);
  // Tools are typed as "Google Sheets, Canva" and split on save
  const [tools, setTools] = useState(initial.tools.join(", "));
  const [preview, setPreview] = useState(false);
  const { run, pending } = useAction();
  const set = <K extends keyof SampleInput>(key: K, value: SampleInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveSample({ ...form, tools: tools.split(",") });
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" htmlFor="sa-title">
          <input
            id="sa-title"
            required
            maxLength={120}
            placeholder="e.g. Email templates for an online shop"
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
          htmlFor="sa-slug"
          hint={form.id ? "Changing this breaks links you've already shared." : undefined}
        >
          <div className="mt-1.5 flex items-center rounded-lg border border-border bg-background focus-within:border-primary">
            <span className="pl-3 font-mono text-sm text-muted">/samples/</span>
            <input
              id="sa-slug"
              required
              maxLength={60}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase())}
              className="w-full min-w-0 bg-transparent py-2 pr-3 pl-0.5 font-mono text-sm focus:outline-none"
            />
          </div>
        </Field>
      </div>

      <Field label="Summary" htmlFor="sa-summary" hint="One sentence for the sample card.">
        <input
          id="sa-summary"
          maxLength={300}
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="sa-description" className="text-sm font-semibold">
            Main description
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
          <div className="mt-1.5 min-h-32 rounded-lg border border-border p-4">
            <Markdown>{form.description || "_Nothing written yet._"}</Markdown>
          </div>
        ) : (
          <textarea
            id="sa-description"
            rows={7}
            maxLength={20000}
            placeholder="What the task was, what you did, and the result."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={`${inputClass} resize-y`}
          />
        )}
        <p className="mt-1 text-xs text-muted">
          Markdown works: <code>**bold**</code>, <code>- list item</code>. Leave a blank line between
          paragraphs.
        </p>
      </div>

      <Field
        label="Tools used"
        htmlFor="sa-tools"
        hint="Separate with commas, e.g. Google Sheets, Canva, Gmail"
      >
        <input
          id="sa-tools"
          value={tools}
          onChange={(e) => setTools(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field
        label="Photos and PDFs"
        hint="Shown in this order on the sample page. The first photo is the card's cover."
      >
        <SampleItemsEditor
          value={form.items}
          onChange={(items) => set("items", items)}
          ownerName={ownerName}
        />
      </Field>

      <ShowForPicker profiles={profiles} value={form.show_for} onChange={(ids) => set("show_for", ids)} />
      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />
      <FormFooter pending={pending} onCancel={onDone} saveLabel={form.id ? "Save sample" : "Add sample"} />
    </form>
  );
}
