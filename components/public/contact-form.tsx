"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useActionState, useState } from "react";
import { type ContactState, sendMessage } from "@/lib/contact-action";
import { CONTACT_LIMITS, type ContactErrors, validateContact } from "@/lib/validation";

const INITIAL: ContactState = { status: "idle", message: "" };

export function ContactForm({ profileSlug }: { profileSlug: string }) {
  // `state` is whatever sendMessage (on the server) returned last time.
  const [state, formAction, pending] = useActionState(sendMessage, INITIAL);
  // Instant checks in the browser, so people don't wait for the server to see a typo.
  const [clientErrors, setClientErrors] = useState<ContactErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    const found = validateContact({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
    });
    setClientErrors(found);
    if (Object.keys(found).length > 0) event.preventDefault(); // don't send
  }

  const errors = { ...state.errors, ...clientErrors };
  const hasClientErrors = Object.keys(clientErrors).length > 0;

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-primary bg-primary-tint p-8">
        <p className="text-lg font-semibold">Message sent</p>
        <p className="mt-2 text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="relative space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      {/* Tells the inbox which profile page the visitor came from */}
      <input type="hidden" name="profile_slug" value={profileSlug} />

      {/* Honeypot: hidden from people, but spam bots tend to fill it in.
          Any message with this field filled is silently dropped. */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Name" name="name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={CONTACT_LIMITS.name}
          defaultValue={state.values?.name}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field label="Email" name="email" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={CONTACT_LIMITS.email}
          defaultValue={state.values?.email}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field label="Message" name="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          maxLength={CONTACT_LIMITS.message}
          defaultValue={state.values?.message}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 disabled:translate-y-0 disabled:opacity-70"
      >
        {pending ? (
          <>
            Sending <LoaderCircle className="size-4 animate-spin" aria-hidden />
          </>
        ) : (
          <>
            Send message <Send className="size-4" aria-hidden />
          </>
        )}
      </button>

      <p role="status" className="text-sm font-medium text-red-700 dark:text-red-200">
        {!hasClientErrors && state.status === "error" ? state.message : ""}
      </p>
    </form>
  );
}

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-foreground transition-colors focus:border-primary aria-[invalid=true]:border-red-600";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-700 dark:text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
