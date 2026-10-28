"use client";

import type { Status } from "@/lib/types";

const OPTIONS = [
  { value: "active", label: "Active", hint: "Shown normally" },
  { value: "coming_soon", label: "Coming soon", hint: "Shown with a badge" },
  { value: "hidden", label: "Hidden", hint: "Only you can see it" },
] as const;

/** Status as three cards to pick from, for add/edit forms. */
export function StatusRadio({ value, onChange }: { value: Status; onChange: (status: Status) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">Status</legend>
      <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${
              value === o.value ? "border-primary bg-primary-tint" : "border-border hover:border-primary"
            }`}
          >
            <input
              type="radio"
              name="status"
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span className="block font-semibold">{o.label}</span>
            <span className="block text-xs text-muted">{o.hint}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
