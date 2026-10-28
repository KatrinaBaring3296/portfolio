"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { saveSkill, type SkillInput } from "@/lib/admin/content-actions";
import { SkillLogo } from "@/components/public/skill-logo";
import type { Skill, SkillGroup, SkillLogo as SkillLogoData } from "@/lib/types";
import { EditorDialog, FormFooter } from "./editor-dialog";
import { LogoPicker } from "./logo-picker";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { type ProfileOption, ShowForPicker, showForLabel } from "./show-for-picker";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, secondaryButtonClass } from "./ui";

const GROUPS: { value: SkillGroup; label: string }[] = [
  { value: "admin", label: "Admin / Office" },
  { value: "technical", label: "Teaching & Tech" },
];

export function SkillsManager({
  skills,
  logos,
  profiles,
}: {
  skills: Skill[];
  logos: Record<string, SkillLogoData | null>; // current logo per skill id
  profiles: ProfileOption[];
}) {
  const [editing, setEditing] = useState<SkillInput | null>(null);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {GROUPS.map((group) => {
          const items = skills.filter((s) => s.skill_group === group.value);
          const ids = items.map((s) => s.id);
          return (
            <section key={group.value} aria-labelledby={`group-${group.value}`} className="self-start">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 id={`group-${group.value}`} className="text-lg font-semibold">
                  {group.label}
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setEditing({ name: "", skill_group: group.value, status: "active", show_for: [] })
                  }
                  className={`${secondaryButtonClass} py-1.5`}
                >
                  <Plus className="size-4" aria-hidden /> Add skill
                </button>
              </div>
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                {items.map((s, i) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                      {logos[s.id] ? (
                        <SkillLogo logo={logos[s.id]!} className="size-5" />
                      ) : (
                        <span className="text-xs text-muted" aria-label="No logo">
                          –
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm">{s.name}</p>
                      {s.show_for.length > 0 && (
                        <p className="truncate text-xs text-muted">{showForLabel(s.show_for, profiles)}</p>
                      )}
                    </div>
                    <StatusSelect table="skills" id={s.id} status={s.status} label={`Status of ${s.name}`} />
                    <div className="flex items-center">
                      <MoveButtons table="skills" ids={ids} index={i} label={s.name} />
                      <button
                        type="button"
                        onClick={() => setEditing(s)}
                        aria-label={`Edit ${s.name}`}
                        className={iconButtonClass}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </button>
                      <DeleteButton table="skills" id={s.id} label={s.name} />
                    </div>
                  </li>
                ))}
                {items.length === 0 && <li className="p-6 text-center text-sm text-muted">No skills yet.</li>}
              </ul>
            </section>
          );
        })}
      </div>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit skill" : "Add skill"}
      >
        {editing && (
          <SkillForm
            initial={editing}
            initialLogo={editing.id ? (logos[editing.id] ?? null) : null}
            profiles={profiles}
            onDone={() => setEditing(null)}
          />
        )}
      </EditorDialog>
    </>
  );
}

function SkillForm({
  initial,
  initialLogo,
  profiles,
  onDone,
}: {
  initial: SkillInput;
  initialLogo: SkillLogoData | null;
  profiles: ProfileOption[];
  onDone: () => void;
}) {
  const [form, setForm] = useState<SkillInput>({
    id: initial.id,
    name: initial.name,
    skill_group: initial.skill_group,
    status: initial.status,
    show_for: initial.show_for,
    icon: initial.icon ?? null,
    logo_url: initial.logo_url ?? null,
  });
  const { run, pending } = useAction();
  const set = <K extends keyof SkillInput>(key: K, value: SkillInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveSkill(form);
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Skill or tool" htmlFor="sk-name" hint="e.g. Google Sheets, Python">
          <input
            id="sk-name"
            required
            maxLength={60}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Group" htmlFor="sk-group">
          <select
            id="sk-group"
            value={form.skill_group}
            onChange={(e) => set("skill_group", e.target.value as SkillGroup)}
            className={inputClass}
          >
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field
        label="Logo"
        hint='Tools with a logo show as tiles under "Tools I use". Abilities (e.g. "Email management") usually look best with No logo.'
      >
        <LogoPicker
          skillName={form.name}
          value={{ icon: form.icon ?? null, logo_url: form.logo_url ?? null }}
          onChange={(choice) => setForm((f) => ({ ...f, ...choice }))}
          initialLogo={initialLogo}
        />
      </Field>
      <ShowForPicker profiles={profiles} value={form.show_for} onChange={(ids) => set("show_for", ids)} />
      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />
      <FormFooter pending={pending} onCancel={onDone} saveLabel={form.id ? "Save" : "Add skill"} />
    </form>
  );
}
