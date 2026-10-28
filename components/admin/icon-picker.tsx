"use client";

import { Icon, ICONS } from "@/components/public/icon";

// Grid of the available icons; the chosen one is highlighted.
export function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Icon" className="mt-1.5 flex flex-wrap gap-2">
      {Object.keys(ICONS).map((name) => {
        const selected = name === value;
        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={name}
            title={name}
            onClick={() => onChange(name)}
            className={`inline-flex size-10 items-center justify-center rounded-lg border transition-colors ${
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted hover:border-primary hover:text-foreground"
            }`}
          >
            <Icon name={name} className="size-5" />
          </button>
        );
      })}
    </div>
  );
}
