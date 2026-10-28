"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { SocialLink } from "@/lib/types";
import { iconButtonClass, inputClass, secondaryButtonClass } from "./ui";

// An editable list of { name, link } rows, e.g. hiring platforms.
// `presets` are one-click buttons that add a row with the name filled in.
export function LinkListEditor({
  id,
  value,
  onChange,
  presets = [],
  namePlaceholder,
  linkPlaceholder,
  addLabel,
}: {
  id: string; // prefix for input ids
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
  presets?: string[];
  namePlaceholder: string;
  linkPlaceholder: string;
  addLabel: string;
}) {
  const update = (index: number, key: keyof SocialLink, text: string) =>
    onChange(value.map((link, i) => (i === index ? { ...link, [key]: text } : link)));

  const move = (index: number, offset: -1 | 1) => {
    const next = [...value];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };

  const add = (label = "") => onChange([...value, { label, url: "" }]);

  // Hide presets that are already in the list
  const unusedPresets = presets.filter(
    (preset) => !value.some((link) => link.label.trim().toLowerCase() === preset.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      {value.map((link, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2 sm:flex-nowrap">
          <div className="w-full sm:w-44">
            <label htmlFor={`${id}-name-${i}`} className="text-xs font-semibold">
              Name
            </label>
            <input
              id={`${id}-name-${i}`}
              placeholder={namePlaceholder}
              maxLength={40}
              value={link.label}
              onChange={(e) => update(i, "label", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor={`${id}-url-${i}`} className="text-xs font-semibold">
              Link
            </label>
            <input
              id={`${id}-url-${i}`}
              inputMode="url"
              autoComplete="url"
              placeholder={linkPlaceholder}
              value={link.url}
              onChange={(e) => update(i, "url", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              aria-label={`Move ${link.label || "row"} up`}
              className={iconButtonClass}
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              disabled={i === value.length - 1}
              onClick={() => move(i, 1)}
              aria-label={`Move ${link.label || "row"} down`}
              className={iconButtonClass}
            >
              <ArrowDown className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={`Remove ${link.label || "row"}`}
              className={iconButtonClass}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button type="button" onClick={() => add()} className={secondaryButtonClass}>
          <Plus className="size-4" aria-hidden /> {addLabel}
        </button>
        {unusedPresets.length > 0 && (
          <>
            <span className="text-xs text-muted">Quick add:</span>
            {unusedPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => add(preset)}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:bg-primary-tint"
              >
                + {preset}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
