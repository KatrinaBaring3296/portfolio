"use client"; // error pages must be Client Components

import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { StatusMessage } from "@/components/public/status-message";

// Shown instead of a public page if something breaks while loading it
// (e.g. the database is briefly unreachable). The header and footer stay.
export default function PublicError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error); // visible in the browser console / Vercel logs
  }, [error]);

  return (
    <StatusMessage
      code="Error"
      title="Something went wrong"
      action={
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40"
        >
          <RotateCw className="size-4" aria-hidden /> Try again
        </button>
      }
    >
      <p>This page couldn&apos;t load right now. Please try again in a moment.</p>
    </StatusMessage>
  );
}
