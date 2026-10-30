"use client";

import { ArrowDown, ArrowUp, ExternalLink, FileText, LoaderCircle, Pencil, Plus, Star } from "lucide-react";
import { useState } from "react";
import { type ProfileInput, saveProfile, setDefaultProfile } from "@/lib/admin/profile-actions";
import { slugify } from "@/lib/admin/slug";
import {
  ALL_SECTIONS,
  completeSectionOrder,
  type FocusProfile,
  type SectionKey,
  type ServiceCategory,
} from "@/lib/types";
import { EditorDialog } from "./editor-dialog";
import { FileUpload } from "./file-upload";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";

const SECTION_LABELS: Record<SectionKey, string> = {
  about: "About",
  services: "Services",
  experience: "Experience",
  samples: "Sample work",
  projects: "Projects",
  skills: "Skills & tools",
  education: "Education",
  certifications: "Certifications",
  testimonials: "Testimonials",
  faq: "FAQ",
  contact: "Contact",
};

const EMPTY: ProfileInput = {
  label: "",
  slug: "",
  headline: "",
  pitch: "",
  status: "active",
  resume_url: null,
  highlighted_category_ids: [],
  section_order: ALL_SECTIONS,
};

export function ProfilesManager({
  profiles,
  categories,
  defaultProfileId,
}: {
  profiles: FocusProfile[];
  categories: ServiceCategory[];
  defaultProfileId: string | null;
}) {
  const [editing, setEditing] = useState<ProfileInput | null>(null);
  const { run, pending } = useAction();
  const ids = profiles.map((p) => p.id);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setEditing(EMPTY)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden /> Add profile
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {profiles.map((p, i) => {
          const isDefault = p.id === defaultProfileId;
          const url = isDefault ? "/" : `/for/${p.slug}`;
          return (
            <li key={p.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {p.label}
                  {isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      <Star className="size-3" aria-hidden /> Default
                    </span>
                  )}
                  {p.resume_url && <FileText className="size-4 text-muted" aria-label="Has a résumé" />}
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-primary-dark hover:underline"
                >
                  {url} <ExternalLink className="size-3" aria-hidden />
                </a>
              </div>
              {!isDefault && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => setDefaultProfile(p.id))}
                  className={`${secondaryButtonClass} py-1.5 text-xs`}
                >
                  Make default
                </button>
              )}
              <StatusSelect
                table="focus_profiles"
                id={p.id}
                status={p.status}
                label={`Status of ${p.label}`}
              />
              <div className="flex items-center">
                <MoveButtons table="focus_profiles" ids={ids} index={i} label={p.label} />
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  aria-label={`Edit ${p.label}`}
                  className={iconButtonClass}
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <DeleteButton
                  table="focus_profiles"
                  id={p.id}
                  label={p.label}
                  description={
                    isDefault
                      ? "This is your default profile. Your main URL will fall back to the first visible profile. Its résumé PDF is deleted too."
                      : "Its page and résumé PDF are deleted. Tip: set it to Hidden instead if you might need it again."
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted">
        The order here is the order profiles appear in the admin. Hidden profiles&apos; pages show &quot;not
        found&quot;.
      </p>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${editing.label}` : "Add profile"}
      >
        {editing && <ProfileForm initial={editing} categories={categories} onDone={() => setEditing(null)} />}
      </EditorDialog>
    </>
  );
}

function ProfileForm({
  initial,
  categories,
  onDone,
}: {
  initial: ProfileInput;
  categories: ServiceCategory[];
  onDone: () => void;
}) {
  const [form, setForm] = useState<ProfileInput>({
    id: initial.id,
    label: initial.label,
    slug: initial.slug,
    headline: initial.headline,
    pitch: initial.pitch,
    status: initial.status,
    resume_url: initial.resume_url,
    // Drop IDs of categories that were deleted since
    highlighted_category_ids: initial.highlighted_category_ids.filter((id) =>
      categories.some((c) => c.id === id),
    ),
    // Adds sections created after this profile was saved (e.g. Certifications)
    section_order: completeSectionOrder(initial.section_order),
  });
  const { run, pending } = useAction();
  const set = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleHighlight = (id: string) =>
    set(
      "highlighted_category_ids",
      form.highlighted_category_ids.includes(id)
        ? form.highlighted_category_ids.filter((x) => x !== id)
        : [...form.highlighted_category_ids, id],
    );

  // Swap an item with its neighbor in a list
  function moved<T>(list: T[], index: number, offset: -1 | 1) {
    const next = [...list];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    return next;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveProfile(form);
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Label" htmlFor="p-label" hint="e.g. Technical VA">
          <input
            id="p-label"
            required
            maxLength={60}
            value={form.label}
            onChange={(e) => {
              const label = e.target.value;
              setForm((f) => ({ ...f, label, slug: f.id ? f.slug : slugify(label) }));
            }}
            className={inputClass}
          />
        </Field>
        <Field
          label="URL name"
          htmlFor="p-slug"
          hint={
            form.id ? "Changing this breaks links you've already sent out." : "Lowercase letters and dashes."
          }
        >
          <div className="mt-1.5 flex items-center rounded-lg border border-border bg-background focus-within:border-primary">
            <span className="pl-3 font-mono text-sm text-muted">/for/</span>
            <input
              id="p-slug"
              required
              maxLength={60}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase())}
              className="w-full min-w-0 bg-transparent py-2 pr-3 pl-0.5 font-mono text-sm focus:outline-none"
            />
          </div>
        </Field>
      </div>

      <Field label="Headline" htmlFor="p-headline" hint="The big title at the top of the page.">
        <input
          id="p-headline"
          maxLength={200}
          value={form.headline}
          onChange={(e) => set("headline", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Pitch" htmlFor="p-pitch" hint="One or two sentences under the headline.">
        <textarea
          id="p-pitch"
          rows={3}
          maxLength={600}
          value={form.pitch}
          onChange={(e) => set("pitch", e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field label="Résumé (PDF)" hint="The Download résumé button on this profile's page.">
        <FileUpload
          bucket="resumes"
          folder="resumes"
          value={form.resume_url}
          onChange={(url) => set("resume_url", url)}
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-semibold">Highlighted service categories</legend>
        <p className="text-xs text-muted">Ticked categories are shown first, in this order.</p>
        <ul className="mt-2 space-y-1.5">
          {/* Ticked ones first (in their chosen order), then the rest */}
          {[
            ...form.highlighted_category_ids.map((id) => categories.find((c) => c.id === id)!),
            ...categories.filter((c) => !form.highlighted_category_ids.includes(c.id)),
          ].map((c) => {
            const position = form.highlighted_category_ids.indexOf(c.id);
            const checked = position !== -1;
            return (
              <li key={c.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
                <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleHighlight(c.id)}
                    className="size-4 accent-primary"
                  />
                  {checked && <span className="font-mono text-xs text-primary-dark">{position + 1}.</span>}
                  {c.name}
                  {c.status === "hidden" && <span className="text-xs text-muted">(hidden)</span>}
                </label>
                {checked && (
                  <>
                    <button
                      type="button"
                      disabled={position === 0}
                      onClick={() =>
                        set("highlighted_category_ids", moved(form.highlighted_category_ids, position, -1))
                      }
                      aria-label={`Move ${c.name} up`}
                      className={`${iconButtonClass} size-7`}
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      disabled={position === form.highlighted_category_ids.length - 1}
                      onClick={() =>
                        set("highlighted_category_ids", moved(form.highlighted_category_ids, position, 1))
                      }
                      aria-label={`Move ${c.name} down`}
                      className={`${iconButtonClass} size-7`}
                    >
                      <ArrowDown className="size-4" aria-hidden />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Homepage section order</legend>
        <p className="text-xs text-muted">
          The hero always comes first. Empty sections are skipped automatically.
        </p>
        <ol className="mt-2 space-y-1.5">
          {form.section_order.map((key, i) => (
            <li
              key={key}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm"
            >
              <span className="w-5 font-mono text-xs text-muted">{i + 1}.</span>
              <span className="flex-1">{SECTION_LABELS[key]}</span>
              <button
                type="button"
                disabled={i === 0}
                onClick={() => set("section_order", moved(form.section_order, i, -1))}
                aria-label={`Move ${SECTION_LABELS[key]} up`}
                className={`${iconButtonClass} size-7`}
              >
                <ArrowUp className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                disabled={i === form.section_order.length - 1}
                onClick={() => set("section_order", moved(form.section_order, i, 1))}
                aria-label={`Move ${SECTION_LABELS[key]} down`}
                className={`${iconButtonClass} size-7`}
              >
                <ArrowDown className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      </fieldset>

      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {form.id ? "Save profile" : "Add profile"}
        </button>
      </div>
    </form>
  );
}
