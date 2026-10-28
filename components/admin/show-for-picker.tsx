"use client";

import type { FocusProfile } from "@/lib/types";

export type ProfileOption = Pick<FocusProfile, "id" | "label" | "status">;

// "Show on these profiles": nothing ticked = every profile.
export function ShowForPicker({
  profiles,
  value,
  onChange,
}: {
  profiles: ProfileOption[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  return (
    <fieldset>
      <legend className="text-sm font-semibold">Show on these profiles</legend>
      <p className="text-xs text-muted">
        {value.length === 0
          ? "Nothing ticked: shown on every profile."
          : `Only shown on ${value.length} profile(s).`}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {profiles.map((p) => {
          const checked = value.includes(p.id);
          return (
            <label
              key={p.id}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${
                checked ? "border-primary bg-primary-tint font-medium" : "border-border hover:border-primary"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(p.id)}
                className="size-4 accent-primary"
              />
              {p.label}
              {p.status === "hidden" && <span className="text-xs text-muted">(hidden)</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Short summary for list rows: "All profiles" or "Online Tutor, Customer Support". */
export function showForLabel(ids: string[], profiles: ProfileOption[]) {
  if (ids.length === 0) return "All profiles";
  const names = ids.map((id) => profiles.find((p) => p.id === id)?.label).filter(Boolean);
  return names.length > 0 ? names.join(", ") : "No existing profile (hidden everywhere)";
}
