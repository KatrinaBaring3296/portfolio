"use client";

import { FileCheck, Pencil, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { type ExperienceInput, saveExperience } from "@/lib/admin/content-actions";
import { type Experience, type ExperienceCategory, experienceProof } from "@/lib/types";
import { EditorDialog, FormFooter } from "./editor-dialog";
import { ProofEditor } from "./proof-editor";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { type ProfileOption, ShowForPicker, showForLabel } from "./show-for-picker";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass } from "./ui";

const CATEGORIES: { value: ExperienceCategory; label: string }[] = [
  { value: "va", label: "Virtual assistance" },
  { value: "teaching", label: "Teaching" },
  { value: "business", label: "Business" },
];

const EMPTY: ExperienceInput = {
  role: "",
  organization: "",
  start_date: "",
  end_date: null,
  description: "",
  category: "va",
  status: "active",
  show_for: [],
};

// "2025-06-01" -> "Jun 2025"
const monthYear = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" });

export function ExperienceManager({
  items,
  profiles,
  ownerName,
}: {
  items: Experience[];
  profiles: ProfileOption[];
  ownerName: string; // stamped on proof images
}) {
  const [editing, setEditing] = useState<ExperienceInput | null>(null);
  const ids = items.map((e) => e.id);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setEditing(EMPTY)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden /> Add experience
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((e, i) => (
          <li key={e.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-2 font-semibold">
                <span>
                  {e.role} <span className="font-normal text-muted">at {e.organization}</span>
                </span>
                {experienceProof(e).length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-2 py-0.5 text-xs font-medium text-primary-dark">
                    <FileCheck className="size-3" aria-hidden /> Proof ({experienceProof(e).length})
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted">
                {monthYear(e.start_date)} – {e.end_date ? monthYear(e.end_date) : "Present"} ·{" "}
                {CATEGORIES.find((c) => c.value === e.category)?.label} · {showForLabel(e.show_for, profiles)}
              </p>
            </div>
            <StatusSelect table="experience" id={e.id} status={e.status} label={`Status of ${e.role}`} />
            <div className="flex items-center">
              <MoveButtons table="experience" ids={ids} index={i} label={e.role} />
              <button
                type="button"
                onClick={() => setEditing({ ...e, proof: experienceProof(e) })}
                aria-label={`Edit ${e.role}`}
                className={iconButtonClass}
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <DeleteButton table="experience" id={e.id} label={`${e.role} at ${e.organization}`} />
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-8 text-center text-muted">
            No experience yet. The Experience section stays hidden until you add some.
          </li>
        )}
      </ul>
      <p className="mt-3 text-xs text-muted">
        The timeline on your site follows this order (put the latest first).
      </p>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit experience" : "Add experience"}
      >
        {editing && (
          <ExperienceForm
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

function ExperienceForm({
  initial,
  profiles,
  ownerName,
  onDone,
}: {
  initial: ExperienceInput;
  profiles: ProfileOption[];
  ownerName: string;
  onDone: () => void;
}) {
  const [form, setForm] = useState<ExperienceInput>({
    id: initial.id,
    role: initial.role,
    organization: initial.organization,
    start_date: initial.start_date,
    end_date: initial.end_date,
    description: initial.description,
    category: initial.category,
    status: initial.status,
    show_for: initial.show_for,
    proof: initial.proof ?? [],
  });
  const { run, pending } = useAction();
  const set = <K extends keyof ExperienceInput>(key: K, value: ExperienceInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveExperience(form);
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Role" htmlFor="ex-role">
          <input
            id="ex-role"
            required
            maxLength={120}
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Organization" htmlFor="ex-org">
          <input
            id="ex-org"
            required
            maxLength={120}
            value={form.organization}
            onChange={(e) => set("organization", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Start date" htmlFor="ex-start" hint="Only the month and year are shown.">
          <input
            id="ex-start"
            type="date"
            required
            value={form.start_date}
            onChange={(e) => set("start_date", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="End date" htmlFor="ex-end">
          <input
            id="ex-end"
            type="date"
            disabled={form.end_date === null}
            value={form.end_date ?? ""}
            min={form.start_date || undefined}
            onChange={(e) => set("end_date", e.target.value)}
            className={`${inputClass} disabled:opacity-50`}
          />
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.end_date === null}
              onChange={(e) => set("end_date", e.target.checked ? null : "")}
              className="size-4 accent-primary"
            />
            I still work here (shows &quot;Present&quot;)
          </label>
        </Field>
      </div>

      <Field label="Type" htmlFor="ex-cat">
        <select
          id="ex-cat"
          value={form.category}
          onChange={(e) => set("category", e.target.value as ExperienceCategory)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="What you did" htmlFor="ex-desc" hint="One or two sentences.">
        <textarea
          id="ex-desc"
          rows={3}
          maxLength={2000}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field label="Proof (optional)">
        <div className="mt-1.5 flex gap-2 rounded-lg border border-border bg-primary-tint p-3 text-xs">
          <ShieldCheck className="size-4 shrink-0 text-primary-dark" aria-hidden />
          <p>
            For example a partner certificate or completion screenshot. Shows a small &quot;View proof&quot;
            button on this entry. Each image is shrunk and stamped with &quot;{ownerName || "your name"} ·
            portfolio copy&quot; before upload; your original stays on your computer.
            <br />
            <strong>Before uploading, cover or crop out</strong> ID numbers, phone numbers, addresses, plate
            numbers, and ID photos. Name, company, and dates are enough.
          </p>
        </div>
        <div className="mt-3">
          <ProofEditor
            value={form.proof ?? []}
            onChange={(items) => set("proof", items)}
            ownerName={ownerName}
          />
        </div>
      </Field>
      <ShowForPicker profiles={profiles} value={form.show_for} onChange={(ids) => set("show_for", ids)} />
      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />
      <FormFooter pending={pending} onCancel={onDone} saveLabel={form.id ? "Save" : "Add experience"} />
    </form>
  );
}
