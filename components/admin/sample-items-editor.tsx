"use client";

import { ArrowDown, ArrowUp, FileText, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { SampleItem } from "@/lib/types";
import { FileUpload } from "./file-upload";
import { iconButtonClass, inputClass } from "./ui";
import { watermarkImage } from "./watermark";

const MAX_ITEMS = 30;

// The photos and PDFs of a work sample, each with its own description.
// Photos can be watermarked in the browser before upload (ticked by default).
export function SampleItemsEditor({
  value,
  onChange,
  ownerName,
}: {
  value: SampleItem[];
  onChange: (items: SampleItem[]) => void;
  ownerName: string;
}) {
  const [watermark, setWatermark] = useState(true);

  const update = (index: number, caption: string) =>
    onChange(value.map((item, i) => (i === index ? { ...item, caption } : item)));

  const move = (index: number, offset: -1 | 1) => {
    const next = [...value];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };

  const add = (kind: SampleItem["kind"]) => (url: string | null, file?: File) =>
    url && onChange([...value, { url, kind, name: file?.name ?? "", caption: "" }]);

  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={item.url} className="flex gap-3 rounded-lg border border-border p-2">
          <div className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-tint">
            {item.kind === "image" ? (
              <Image src={item.url} alt={`File ${i + 1}`} fill sizes="112px" className="object-cover" />
            ) : (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-1 text-center text-xs font-semibold text-primary-dark"
              >
                <FileText className="size-6" aria-hidden />
                <span className="line-clamp-2 break-all">{item.name || "PDF"}</span>
              </a>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor={`sample-caption-${i}`} className="text-xs font-semibold">
              Description of this {item.kind === "pdf" ? "file" : "photo"} (optional)
            </label>
            <textarea
              id={`sample-caption-${i}`}
              rows={3}
              maxLength={1000}
              value={item.caption}
              onChange={(e) => update(i, e.target.value)}
              placeholder="What this shows, and what you did. e.g. A weekly schedule I built for a client's team of 8."
              className={`${inputClass} mt-1 resize-y`}
            />
          </div>
          <div className="flex flex-col">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              aria-label={`Move file ${i + 1} up`}
              className={`${iconButtonClass} size-7`}
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              disabled={i === value.length - 1}
              onClick={() => move(i, 1)}
              aria-label={`Move file ${i + 1} down`}
              className={`${iconButtonClass} size-7`}
            >
              <ArrowDown className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={`Remove file ${i + 1}`}
              className={`${iconButtonClass} size-7`}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ))}

      {value.length < MAX_ITEMS && (
        <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {/* Uploaders that always start empty; each upload adds a new item */}
            <FileUpload
              bucket="images"
              folder="samples"
              value={null}
              label="Add photo"
              transform={
                watermark
                  ? (file) => watermarkImage(file, ownerName, "work sample · not for reuse")
                  : undefined
              }
              onChange={add("image")}
            />
            <FileUpload
              bucket="resumes"
              folder="samples"
              value={null}
              label="Add PDF"
              onChange={add("pdf")}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={watermark}
              onChange={(e) => setWatermark(e.target.checked)}
              className="size-4 accent-primary"
            />
            Watermark photos with my name (untick for work you want shown clean)
          </label>
          <p className="text-xs text-muted">
            Word, Excel, or PowerPoint samples: save them as PDF first (File &gt; Save as / Export &gt; PDF).
            Cover any client names, emails, or private details before uploading.
          </p>
        </div>
      )}
    </div>
  );
}
