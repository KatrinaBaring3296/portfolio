"use client";

import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import { FileUpload } from "./file-upload";
import { iconButtonClass } from "./ui";

// A list of images you can add to, reorder, and remove: a project's
// screenshots, or the proof images on a work experience entry.
export function GalleryEditor({
  value,
  onChange,
  folder = "projects",
  itemLabel = "screenshot",
  addLabel = "Add screenshot",
  max = 20,
  transform,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string; // storage folder for uploads
  itemLabel?: string; // for button labels, e.g. "Move screenshot 2 earlier"
  addLabel?: string;
  max?: number;
  transform?: (file: File) => Promise<File>; // e.g. watermarking, before upload
}) {
  const move = (index: number, offset: -1 | 1) => {
    const next = [...value];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };

  return (
    <div>
      {value.length > 0 && (
        <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, i) => (
            <li key={url} className="overflow-hidden rounded-lg border border-border">
              <div className="relative aspect-video bg-primary-tint">
                <Image src={url} alt={`${itemLabel} ${i + 1}`} fill sizes="200px" className="object-cover" />
              </div>
              <div className="flex justify-between p-1">
                <div className="flex">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label={`Move ${itemLabel} ${i + 1} earlier`}
                    className={`${iconButtonClass} size-7`}
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={i === value.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label={`Move ${itemLabel} ${i + 1} later`}
                    className={`${iconButtonClass} size-7`}
                  >
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  aria-label={`Remove ${itemLabel} ${i + 1}`}
                  className={`${iconButtonClass} size-7`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {value.length < max && (
        // An uploader that always starts empty; each upload is added to the list
        <FileUpload
          bucket="images"
          folder={folder}
          value={null}
          label={addLabel}
          transform={transform}
          onChange={(url) => url && onChange([...value, url])}
        />
      )}
    </div>
  );
}
