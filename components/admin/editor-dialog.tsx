"use client";

import { LoaderCircle, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { iconButtonClass, primaryButtonClass, secondaryButtonClass } from "./ui";

/** Cancel + Save buttons at the bottom of a dialog form. */
export function FormFooter({
  pending,
  onCancel,
  saveLabel,
}: {
  pending: boolean;
  onCancel: () => void;
  saveLabel: string;
}) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} className={secondaryButtonClass}>
        Cancel
      </button>
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {saveLabel}
      </button>
    </div>
  );
}

// A pop-up panel for add/edit forms. Open it by setting `open` to true;
// it calls onClose when the person presses Esc, clicks X, or saves.
export function EditorDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="editor-title"
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50"
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 id="editor-title" className="text-xl font-bold">
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label="Close" className={iconButtonClass}>
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
