"use client";

import { ChevronLeft, ChevronRight, FileCheck, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { ProofItem } from "@/lib/types";

// "View proof" button on a work experience entry. Opens the proof images in a
// view-only viewer: no download button, right-click and drag-to-save blocked.
// The images themselves are watermarked, reduced copies (see admin/watermark.ts).
const noSave = {
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  onDragStart: (e: React.DragEvent) => e.preventDefault(),
};

export function ProofViewer({
  items,
  title,
  label = "View proof",
  eyebrow = "Proof",
  note = "Watermarked preview copy, shared to confirm this role.",
}: {
  items: ProofItem[];
  title: string;
  label?: string;
  eyebrow?: string;
  note?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const many = items.length > 1;
  const go = (offset: number) => setIndex((i) => (i + offset + items.length) % items.length);
  const current = items[index];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          dialogRef.current?.showModal();
        }}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-primary-dark transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary-tint"
      >
        <FileCheck className="size-3.5" aria-hidden /> {label}
        {many ? ` (${items.length})` : ""}
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`${eyebrow}: ${title}`}
        // Arrow keys flip between images
        onKeyDown={(e) => {
          if (many && e.key === "ArrowRight") go(1);
          if (many && e.key === "ArrowLeft") go(-1);
        }}
        // Clicking the dimmed background closes it
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-3xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/70"
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-0">
          <div>
            <p className="font-mono text-xs font-medium tracking-widest text-primary-dark uppercase">
              {eyebrow}
            </p>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-primary-tint hover:text-foreground"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div
          className="relative m-5 aspect-4/3 overflow-hidden rounded-xl bg-primary-tint select-none"
          {...noSave}
        >
          <Image
            key={current.url}
            src={current.url}
            alt={current.caption || `Proof ${index + 1} of ${items.length} (preview copy)`}
            fill
            sizes="(min-width: 896px) 856px, 100vw"
            draggable={false}
            className="pointer-events-none object-contain"
          />
          {many && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute top-1/2 left-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow-md hover:bg-surface"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute top-1/2 right-2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow-md hover:bg-surface"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </>
          )}
        </div>

        {/* Your caption for this image: what it shows and what you did */}
        {current.caption && (
          <p
            aria-live="polite"
            className="mx-5 -mt-1 mb-4 rounded-xl border-l-4 border-primary bg-primary-tint px-4 py-3 text-sm leading-relaxed whitespace-pre-line"
          >
            {current.caption}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 px-5 pb-5 text-xs text-muted">
          <p>{note}</p>
          {many && (
            <p aria-live="polite">
              {index + 1} / {items.length}
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
