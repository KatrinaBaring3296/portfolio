"use client";

import { LoaderCircle, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Icon } from "@/components/public/icon";
import { type CategoryInput, saveCategory } from "@/lib/admin/catalog-actions";
import { slugify } from "@/lib/admin/slug";
import type { ServiceCategory } from "@/lib/types";
import { EditorDialog } from "./editor-dialog";
import { IconPicker } from "./icon-picker";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";

const EMPTY: CategoryInput = { name: "", slug: "", description: "", icon: "Sparkles", status: "active" };

export function CategoriesManager({
  categories,
  serviceCounts,
}: {
  categories: ServiceCategory[];
  serviceCounts: Record<string, number>;
}) {
  // null = dialog closed; otherwise the category being edited (no id = new)
  const [editing, setEditing] = useState<CategoryInput | null>(null);
  const ids = categories.map((c) => c.id);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setEditing(EMPTY)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden /> Add category
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {categories.map((c, i) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary-dark">
              <Icon name={c.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="truncate text-sm text-muted">
                {serviceCounts[c.id] ?? 0} services · {c.description || "No description"}
              </p>
            </div>
            <StatusSelect
              table="service_categories"
              id={c.id}
              status={c.status}
              label={`Status of ${c.name}`}
            />
            <div className="flex items-center">
              <MoveButtons table="service_categories" ids={ids} index={i} label={c.name} />
              <button
                type="button"
                onClick={() => setEditing(c)}
                aria-label={`Edit ${c.name}`}
                className={iconButtonClass}
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <DeleteButton
                table="service_categories"
                id={c.id}
                label={c.name}
                description={`This also deletes its ${serviceCounts[c.id] ?? 0} services. Tip: set it to Hidden instead if you might need it again.`}
              />
            </div>
          </li>
        ))}
        {categories.length === 0 && <li className="p-8 text-center text-muted">No categories yet.</li>}
      </ul>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit category" : "Add category"}
      >
        {editing && <CategoryForm initial={editing} onDone={() => setEditing(null)} />}
      </EditorDialog>
    </>
  );
}

function CategoryForm({ initial, onDone }: { initial: CategoryInput; onDone: () => void }) {
  const [form, setForm] = useState<CategoryInput>({
    id: initial.id,
    name: initial.name,
    slug: initial.slug,
    description: initial.description,
    icon: initial.icon,
    status: initial.status,
  });
  const { run, pending } = useAction();
  const set = <K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveCategory(form);
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <Field label="Name" htmlFor="cat-name">
        <input
          id="cat-name"
          required
          maxLength={80}
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            // Fill the slug automatically for new categories
            setForm((f) => ({ ...f, name, slug: f.id ? f.slug : slugify(name) }));
          }}
          className={inputClass}
        />
      </Field>
      <Field
        label="Slug"
        htmlFor="cat-slug"
        hint="Short ID with lowercase letters and dashes, e.g. customer-support."
      >
        <input
          id="cat-slug"
          required
          maxLength={60}
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Description" htmlFor="cat-desc" hint="One short sentence, shown under the category name.">
        <input
          id="cat-desc"
          maxLength={300}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Icon">
        <IconPicker value={form.icon} onChange={(icon) => set("icon", icon)} />
      </Field>
      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {form.id ? "Save" : "Add category"}
        </button>
      </div>
    </form>
  );
}
