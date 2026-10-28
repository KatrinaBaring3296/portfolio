"use client";

import { LoaderCircle, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Icon } from "@/components/public/icon";
import { saveService, type ServiceInput } from "@/lib/admin/catalog-actions";
import type { Service, ServiceCategory } from "@/lib/types";
import { EditorDialog } from "./editor-dialog";
import { IconPicker } from "./icon-picker";
import { DeleteButton, MoveButtons, StatusPill, StatusSelect, useAction } from "./row-controls";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";

export function ServicesManager({
  categories,
  services,
}: {
  categories: ServiceCategory[];
  services: Service[];
}) {
  const [editing, setEditing] = useState<ServiceInput | null>(null);

  const newService = (categoryId: string): ServiceInput => ({
    category_id: categoryId,
    title: "",
    description: "",
    icon: "Sparkles",
    status: "active",
  });

  if (categories.length === 0) {
    return <p className="text-muted">Add a category first, then you can add services to it.</p>;
  }

  return (
    <>
      <div className="space-y-8">
        {categories.map((category) => {
          const items = services.filter((s) => s.category_id === category.id);
          const ids = items.map((s) => s.id);
          return (
            <section key={category.id} aria-labelledby={`cat-${category.id}`}>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <Icon name={category.icon} className="size-5 text-primary" />
                <h2 id={`cat-${category.id}`} className="text-lg font-semibold">
                  {category.name}
                </h2>
                {category.status !== "active" && <StatusPill status={category.status} />}
                <button
                  type="button"
                  onClick={() => setEditing(newService(category.id))}
                  className={`${secondaryButtonClass} ml-auto py-1.5`}
                >
                  <Plus className="size-4" aria-hidden /> Add service
                </button>
              </div>
              {category.status === "hidden" && (
                <p className="mb-3 text-xs text-muted">
                  This whole category is hidden, so none of its services show on the site.
                </p>
              )}

              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                {items.map((s, i) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary-dark">
                      <Icon name={s.icon} className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{s.title}</p>
                      <p className="truncate text-sm text-muted">{s.description}</p>
                    </div>
                    <StatusSelect
                      table="services"
                      id={s.id}
                      status={s.status}
                      label={`Status of ${s.title}`}
                    />
                    <div className="flex items-center">
                      <MoveButtons table="services" ids={ids} index={i} label={s.title} />
                      <button
                        type="button"
                        onClick={() => setEditing(s)}
                        aria-label={`Edit ${s.title}`}
                        className={iconButtonClass}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </button>
                      <DeleteButton table="services" id={s.id} label={s.title} />
                    </div>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="p-6 text-center text-sm text-muted">No services yet.</li>
                )}
              </ul>
            </section>
          );
        })}
      </div>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit service" : "Add service"}
      >
        {editing && <ServiceForm initial={editing} categories={categories} onDone={() => setEditing(null)} />}
      </EditorDialog>
    </>
  );
}

function ServiceForm({
  initial,
  categories,
  onDone,
}: {
  initial: ServiceInput;
  categories: ServiceCategory[];
  onDone: () => void;
}) {
  const [form, setForm] = useState<ServiceInput>({
    id: initial.id,
    category_id: initial.category_id,
    title: initial.title,
    description: initial.description,
    icon: initial.icon,
    status: initial.status,
  });
  const { run, pending } = useAction();
  const set = <K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveService(form);
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <Field label="Title" htmlFor="svc-title">
        <input
          id="svc-title"
          required
          maxLength={80}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="One-line description" htmlFor="svc-desc">
        <input
          id="svc-desc"
          maxLength={200}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Category" htmlFor="svc-cat">
        <select
          id="svc-cat"
          value={form.category_id}
          onChange={(e) => set("category_id", e.target.value)}
          className={inputClass}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
          {form.id ? "Save" : "Add service"}
        </button>
      </div>
    </form>
  );
}
