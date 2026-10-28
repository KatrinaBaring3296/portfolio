"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { saveTestimonial, type TestimonialInput } from "@/lib/admin/content-actions";
import type { Testimonial } from "@/lib/types";
import { EditorDialog, FormFooter } from "./editor-dialog";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass } from "./ui";

const EMPTY: TestimonialInput = { name: "", role: "", quote: "", status: "active" };

export function TestimonialsManager({ items }: { items: Testimonial[] }) {
  const [editing, setEditing] = useState<TestimonialInput | null>(null);
  const ids = items.map((t) => t.id);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setEditing(EMPTY)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden /> Add testimonial
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((t, i) => (
          <li key={t.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-1 text-xs text-muted">
                <span className="font-semibold text-foreground">{t.name}</span>
                {t.role && <> · {t.role}</>}
              </p>
            </div>
            <StatusSelect
              table="testimonials"
              id={t.id}
              status={t.status}
              label={`Status of ${t.name}'s testimonial`}
            />
            <div className="flex items-center">
              <MoveButtons table="testimonials" ids={ids} index={i} label={`${t.name}'s testimonial`} />
              <button
                type="button"
                onClick={() => setEditing(t)}
                aria-label={`Edit ${t.name}'s testimonial`}
                className={iconButtonClass}
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <DeleteButton table="testimonials" id={t.id} label={`${t.name}'s testimonial`} />
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-8 text-center text-muted">
            No testimonials yet. The section stays hidden until you add one.
          </li>
        )}
      </ul>
      <p className="mt-3 text-xs text-muted">Only add real feedback, with the person&apos;s permission.</p>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit testimonial" : "Add testimonial"}
      >
        {editing && <TestimonialForm initial={editing} onDone={() => setEditing(null)} />}
      </EditorDialog>
    </>
  );
}

function TestimonialForm({ initial, onDone }: { initial: TestimonialInput; onDone: () => void }) {
  const [form, setForm] = useState<TestimonialInput>({
    id: initial.id,
    name: initial.name,
    role: initial.role,
    quote: initial.quote,
    status: initial.status,
  });
  const { run, pending } = useAction();
  const set = <K extends keyof TestimonialInput>(key: K, value: TestimonialInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveTestimonial(form);
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="t-name">
          <input
            id="t-name"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Role" htmlFor="t-role" hint="e.g. Owner, Example Co.">
          <input
            id="t-role"
            maxLength={120}
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Quote" htmlFor="t-quote">
        <textarea
          id="t-quote"
          required
          rows={4}
          maxLength={1500}
          value={form.quote}
          onChange={(e) => set("quote", e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>
      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />
      <FormFooter pending={pending} onCancel={onDone} saveLabel={form.id ? "Save" : "Add testimonial"} />
    </form>
  );
}
