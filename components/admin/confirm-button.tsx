"use client";

import { useRef } from "react";

// A button that asks "Are you sure?" in a dialog before running `onConfirm`.
// Used for every delete in the admin.
export function ConfirmButton({
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  disabled,
  className,
  children,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode; // the button's content, e.g. a trash icon
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => dialogRef.current?.showModal()}
        className={className}
      >
        {children}
      </button>

      {/* Native <dialog>: handles focus, Esc to close, and the dimmed backdrop */}
      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-6 text-foreground shadow-xl backdrop:bg-black/50"
      >
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-primary-tint"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              onConfirm();
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
