"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { type EducationInput, saveEducation } from "@/lib/admin/content-actions";
import { type Education, educationYears } from "@/lib/types";
import { EditorDialog, FormFooter } from "./editor-dialog";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { SampleItemsEditor } from "./sample-items-editor";
import { type ProfileOption, ShowForPicker, showForLabel } from "./show-for-picker";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass } from "./ui";

const EMPTY: EducationInput = {
  school: "",
  program: "",
  location: "",
  start_year: null,
  end_year: null,
  in_progress: false,
  details: "",
  files: [],
  status: "active",
  show_for: [],
};

const toInput = (e: Education): EducationInput => ({
  id: e.id,
  school: e.school,
  program: e.program,
  location: e.location,
  start_year: e.start_year,
  end_year: e.end_year,
  in_progress: e.in_progress,
  details: e.details,
  files: e.files ?? [],
  status: e.status,
  show_for: e.show_for,
});

export function EducationManager({
  items,
  profiles,
  ownerName,
  tableMissing,
}: {
  items: Education[];
  profiles: ProfileOption[];
  ownerName: string; // stamped on watermarked photos
  tableMissing: boolean;
}) {
  const [editing, setEditing] = useState<EducationInput | null>(null);
  const ids = items.map((e) => e.id);

  if (tableMissing) {
    return (
      <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        One-time setup needed: run <code className="font-mono">supabase/updates/0012_education.sql</code>{" "}
        in the Supabase SQL Editor, then refresh this page.
      </p>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setEditing(EMPTY)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden /> Add school
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((e, i) => (
          <li key={e.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{e.program}</p>
              <p className="truncate text-sm text-muted">
                {[e.school, educationYears(e)].filter(Boolean).join(" · ")}
              </p>
              {e.show_for.length > 0 && (
                <p className="text-xs text-muted">{showForLabel(e.show_for, profiles)}</p>
              )}
            </div>
            <StatusSelect table="education" id={e.id} status={e.status} label={`Status of ${e.program}`} />
            <div className="flex items-center">
              <MoveButtons table="education" ids={ids} index={i} label={e.program} />
              <button
                type="button"
                onClick={() => setEditing(toInput(e))}
                aria-label={`Edit ${e.program}`}
                className={iconButtonClass}
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <DeleteButton table="education" id={e.id} label={e.program} />
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-8 text-center text-muted">
            No schools yet. The Education section stays hidden until you add one.
          </li>
        )}
      </ul>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit education" : "Add education"}
      >
        {editing && (
          <EducationForm
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

// Years are typed as text and turned into numbers (empty = none)
const toYear = (value: string) => (value.trim() === "" ? null : Number(value));

function EducationForm({
  initial,
  profiles,
  ownerName,
  onDone,
}: {
  initial: EducationInput;
  profiles: ProfileOption[];
  ownerName: string;
  onDone: () => void;
}) {
  const [form, setForm] = useState<EducationInput>(initial);
  const { run, pending } = useAction();
  const set = <K extends keyof EducationInput>(key: K, value: EducationInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveEducation(form);
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <Field
        label="Program, strand, or degree"
        htmlFor="ed-program"
        hint="e.g. Bachelor of Elementary Education, or Senior High School · HUMSS Strand"
      >
        <input
          id="ed-program"
          required
          maxLength={150}
          value={form.program}
          onChange={(e) => set("program", e.target.value)}
          className={inputClass}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="School" htmlFor="ed-school">
          <input
            id="ed-school"
            required
            maxLength={150}
            value={form.school}
            onChange={(e) => set("school", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Location (optional)" htmlFor="ed-location" hint="e.g. Zamboanga City">
          <input
            id="ed-location"
            maxLength={100}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Start year (optional)" htmlFor="ed-start">
          <input
            id="ed-start"
            type="number"
            min={1950}
            max={2100}
            placeholder="2016"
            value={form.start_year ?? ""}
            onChange={(e) => set("start_year", toYear(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Graduation year" htmlFor="ed-end" hint="Or the year you expect to graduate.">
          <input
            id="ed-end"
            type="number"
            min={1950}
            max={2100}
            placeholder="2018"
            value={form.end_year ?? ""}
            onChange={(e) => set("end_year", toYear(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.in_progress}
          onChange={(e) => set("in_progress", e.target.checked)}
          className="size-4 accent-primary"
        />
        I&apos;m still studying here (shows &ldquo;Expected {form.end_year ?? "year"}&rdquo;)
      </label>
      <Field
        label="Details (optional)"
        htmlFor="ed-details"
        hint="Honors, awards, focus subjects, or your thesis. 1–3 short lines."
      >
        <textarea
          id="ed-details"
          rows={4}
          maxLength={1000}
          value={form.details}
          onChange={(e) => set("details", e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>
      <Field
        label="Diploma and documents (optional)"
        hint="A photo or scan of your diploma, certificate of graduation, or transcript. Visitors can view them but not download photos."
      >
        <SampleItemsEditor
          value={form.files}
          onChange={(files) => set("files", files)}
          ownerName={ownerName}
          folder="education"
          max={10}
          watermarkNote="copy for viewing only · not an official document"
          placeholder="e.g. College diploma, Bachelor of Elementary Education"
          hint={
            <>
              Photos work best: they get your watermark and can&apos;t be downloaded. PDFs aren&apos;t
              watermarked. Cover your LRN, student number, license number, and signatures before uploading.
            </>
          }
        />
      </Field>
      <ShowForPicker profiles={profiles} value={form.show_for} onChange={(ids) => set("show_for", ids)} />
      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />
      <FormFooter pending={pending} onCancel={onDone} saveLabel={form.id ? "Save" : "Add school"} />
    </form>
  );
}
