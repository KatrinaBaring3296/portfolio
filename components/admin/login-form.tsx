"use client";

import { LoaderCircle, LogIn } from "lucide-react";
import { useActionState } from "react";
import { type LoginState, login } from "@/lib/auth-actions";

const INITIAL: LoginState = { error: "" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:shadow-md disabled:opacity-70"
      >
        {pending ? (
          <>
            Signing in <LoaderCircle className="size-4 animate-spin" aria-hidden />
          </>
        ) : (
          <>
            Sign in <LogIn className="size-4" aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-foreground transition-colors focus:border-primary";
