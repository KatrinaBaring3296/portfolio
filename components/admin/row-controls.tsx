"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { type ContentTable, deleteRow, reorder, setStatus } from "@/lib/admin/row-actions";
import type { ActionResult } from "@/lib/admin/shared";
import type { Status } from "@/lib/types";
import { ConfirmButton } from "./confirm-button";
import { useToast } from "./toast";
import { iconButtonClass } from "./ui";

// Small controls used in every admin list: status dropdown, up/down, delete.

/** Runs a server action and shows its result as a toast. */
export function useAction() {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      const result = await action();
      toast(result.message, result.ok ? "success" : "error");
    });
  return { run, pending };
}

export const STATUS_LABELS: Record<Status, string> = {
  active: "Active",
  coming_soon: "Coming soon",
  hidden: "Hidden",
};

// green = active, amber = coming soon, gray = hidden
const STATUS_STYLES: Record<Status, string> = {
  active:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  coming_soon:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200",
  hidden:
    "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

/** A status pill you can click to change (saves immediately). */
export function StatusSelect({
  table,
  id,
  status,
  label,
}: {
  table: ContentTable;
  id: string;
  status: Status;
  label: string; // for screen readers, e.g. "Status of General VA"
}) {
  const { run, pending } = useAction();
  return (
    <select
      aria-label={label}
      value={status}
      disabled={pending}
      onChange={(e) => run(() => setStatus(table, id, e.target.value as Status))}
      className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium disabled:opacity-60 ${STATUS_STYLES[status]}`}
    >
      {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

/** Up/down buttons. `ids` is the current order of the list this row is in. */
export function MoveButtons({
  table,
  ids,
  index,
  label,
}: {
  table: ContentTable;
  ids: string[];
  index: number;
  label: string;
}) {
  const { run, pending } = useAction();
  const move = (offset: -1 | 1) => {
    const next = [...ids];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    run(() => reorder(table, next));
  };
  return (
    <div className="flex">
      <button
        type="button"
        disabled={pending || index === 0}
        onClick={() => move(-1)}
        aria-label={`Move ${label} up`}
        className={iconButtonClass}
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        disabled={pending || index === ids.length - 1}
        onClick={() => move(1)}
        aria-label={`Move ${label} down`}
        className={iconButtonClass}
      >
        <ArrowDown className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function DeleteButton({
  table,
  id,
  label,
  description,
}: {
  table: ContentTable;
  id: string;
  label: string;
  description?: string;
}) {
  const { run, pending } = useAction();
  return (
    <ConfirmButton
      title={`Delete "${label}"?`}
      description={description ?? "This can't be undone."}
      onConfirm={() => run(() => deleteRow(table, id))}
      disabled={pending}
      className={iconButtonClass}
    >
      <Trash2 className="size-4" aria-hidden />
      <span className="sr-only">Delete {label}</span>
    </ConfirmButton>
  );
}
