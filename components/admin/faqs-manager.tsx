"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { type FaqInput, saveFaq } from "@/lib/admin/content-actions";
import type { Faq } from "@/lib/types";
import { EditorDialog, FormFooter } from "./editor-dialog";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { type ProfileOption, ShowForPicker, showForLabel } from "./show-for-picker";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass } from "./ui";

const EMPTY: FaqInput = { question: "", answer: "", status: "active", show_for: [] };

// Starter questions VA clients commonly ask; one click fills the question in.
const SUGGESTIONS = [
  "What are your working hours?",
  "How do you communicate and give updates?",
  "How soon can you start?",
  "How do you prefer to be paid?",
  "Do you work with clients outside the Philippines?",
  "What tools do you already know?",
];

export function FaqsManager({
  items,
  profiles,
  tableMissing,
}: {
  items: Faq[];
  profiles: ProfileOption[];
  tableMissing: boolean;
}) {
  const [editing, setEditing] = useState<FaqInput | null>(null);
  const ids = items.map((f) => f.id);

  if (tableMissing) {
    return (
      <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        One-time setup needed: run <code className="font-mono">supabase/setup.sql</code> in the Supabase SQL
        Editor, then refresh this page.
      </p>
    );
  }

  const unused = SUGGESTIONS.filter((s) => !items.some((f) => f.question.toLowerCase() === s.toLowerCase()));

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setEditing(EMPTY)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden /> Add question
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((f, i) => (
          <li key={f.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{f.question}</p>
              <p className="truncate text-sm text-muted">{f.answer}</p>
              {f.show_for.length > 0 && (
                <p className="text-xs text-muted">{showForLabel(f.show_for, profiles)}</p>
              )}
            </div>
            <StatusSelect table="faqs" id={f.id} status={f.status} label={`Status of "${f.question}"`} />
            <div className="flex items-center">
              <MoveButtons table="faqs" ids={ids} index={i} label={f.question} />
              <button
                type="button"
                onClick={() => setEditing(f)}
                aria-label={`Edit "${f.question}"`}
                className={iconButtonClass}
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <DeleteButton table="faqs" id={f.id} label={f.question} />
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="p-8 text-center text-muted">
            No questions yet. The FAQ section stays hidden until you add one.
          </li>
        )}
      </ul>

      {unused.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Common client questions:</span>
          {unused.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => setEditing({ ...EMPTY, question })}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-primary-tint"
            >
              + {question}
            </button>
          ))}
        </div>
      )}

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit question" : "Add question"}
      >
        {editing && <FaqForm initial={editing} profiles={profiles} onDone={() => setEditing(null)} />}
      </EditorDialog>
    </>
  );
}

function FaqForm({
  initial,
  profiles,
  onDone,
}: {
  initial: FaqInput;
  profiles: ProfileOption[];
  onDone: () => void;
}) {
  const [form, setForm] = useState<FaqInput>({
    id: initial.id,
    question: initial.question,
    answer: initial.answer,
    status: initial.status,
    show_for: initial.show_for,
  });
  const { run, pending } = useAction();
  const set = <K extends keyof FaqInput>(key: K, value: FaqInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveFaq(form);
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <Field label="Question" htmlFor="faq-q">
        <input
          id="faq-q"
          required
          maxLength={200}
          value={form.question}
          onChange={(e) => set("question", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Answer" htmlFor="faq-a" hint="Short and direct: 1–3 sentences works best.">
        <textarea
          id="faq-a"
          required
          rows={5}
          maxLength={2000}
          value={form.answer}
          onChange={(e) => set("answer", e.target.value)}
          className={`${inputClass} resize-y`}
        />
      </Field>
      <ShowForPicker profiles={profiles} value={form.show_for} onChange={(ids) => set("show_for", ids)} />
      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />
      <FormFooter pending={pending} onCancel={onDone} saveLabel={form.id ? "Save" : "Add question"} />
    </form>
  );
}
