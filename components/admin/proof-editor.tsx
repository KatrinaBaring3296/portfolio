"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import Image from "next/image";
import type { ProofItem } from "@/lib/types";
import { FileUpload } from "./file-upload";
import { iconButtonClass, inputClass } from "./ui";
import { watermarkImage } from "./watermark";

const MAX_ITEMS = 6;

// Proof images for a work experience entry, each with an optional caption
// ("I built this inventory sheet", "Rated 4.9 by customers"). Images are
// watermarked in the browser before upload.
export function ProofEditor({
  value,
  onChange,
  ownerName,
}: {
  value: ProofItem[];
  onChange: (items: ProofItem[]) => void;
  ownerName: string;
}) {
  const update = (index: number, caption: string) =>
    onChange(value.map((item, i) => (i === index ? { ...item, caption } : item)));

  const move = (index: number, offset: -1 | 1) => {
    const next = [...value];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={item.url} className="flex gap-3 rounded-lg border border-border p-2">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-primary-tint">
            <Image src={item.url} alt={`Proof ${i + 1}`} fill sizes="112px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor={`proof-caption-${i}`} className="text-xs font-semibold">
              Caption (optional)
            </label>
            <textarea
              id={`proof-caption-${i}`}
              rows={2}
              maxLength={500}
              value={item.caption}
              onChange={(e) => update(i, e.target.value)}
              placeholder="What this shows, and what you did. e.g. I set up and managed this inventory sheet for the store."
              className={`${inputClass} mt-1 resize-y`}
            />
          </div>
          <div className="flex flex-col">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              aria-label={`Move proof ${i + 1} up`}
              className={`${iconButtonClass} size-7`}
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              disabled={i === value.length - 1}
              onClick={() => move(i, 1)}
              aria-label={`Move proof ${i + 1} down`}
              className={`${iconButtonClass} size-7`}
            >
              <ArrowDown className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={`Remove proof ${i + 1}`}
              className={`${iconButtonClass} size-7`}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ))}

      {value.length < MAX_ITEMS && (
        // An uploader that always starts empty; each upload adds a new proof item
        <FileUpload
          bucket="images"
          folder="proof"
          value={null}
          label="Add proof image"
          transform={(file) => watermarkImage(file, ownerName, "portfolio copy · not for reuse")}
          onChange={(url) => url && onChange([...value, { url, caption: "" }])}
        />
      )}
    </div>
  );
}
