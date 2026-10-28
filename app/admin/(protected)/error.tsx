"use client"; // error pages must be Client Components

import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { primaryButtonClass } from "@/components/admin/ui";

// Shown in place of an admin page that failed to load. The sidebar stays,
// so you can go somewhere else or try again.
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // In production, server error details are hidden; `digest` matches the server log entry
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <div role="alert" className="rounded-2xl border border-red-300 bg-surface p-6 dark:border-red-400">
      <h1 className="text-xl font-bold">This page couldn&apos;t load</h1>
      <p className="mt-2 text-sm text-muted">
        Usually it&apos;s a brief connection problem. Try again; if it keeps happening, log out and back in.
      </p>
      {digest && <p className="mt-2 font-mono text-xs text-muted">Error ID: {digest}</p>}
      <button type="button" onClick={() => retry()} className={`${primaryButtonClass} mt-5`}>
        <RotateCw className="size-4" aria-hidden /> Try again
      </button>
    </div>
  );
}
