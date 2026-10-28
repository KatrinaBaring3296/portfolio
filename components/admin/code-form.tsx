"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";
import { type CodeState, verifyLoginCode } from "@/lib/mfa-actions";
import { primaryButtonClass } from "./ui";

const INITIAL: CodeState = { error: "" };

// The 6-digit 2FA code field on the login code page.
export function CodeForm() {
  const [state, formAction, pending] = useActionState(verifyLoginCode, INITIAL);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="code" className="text-sm font-semibold">
          6-digit code
        </label>
        <input
          id="code"
          name="code"
          required
          autoFocus
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          placeholder="123 456"
          className="mt-1.5 block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-center font-mono text-2xl tracking-[0.3em] text-foreground transition-colors focus:border-primary"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-200">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} w-full py-3`}>
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        Verify
      </button>
    </form>
  );
}
