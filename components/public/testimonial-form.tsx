"use client";

import { CircleCheck, LoaderCircle, Send } from "lucide-react";
import { useActionState } from "react";
import { submitTestimonial, type TestimonialFormState } from "@/lib/testimonial-action";
import { TESTIMONIAL_LIMITS } from "@/lib/testimonial-limits";

const INITIAL: TestimonialFormState = { status: "idle", message: "" };

const inputClass =
  "mt-1.5 block w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-foreground transition-colors focus:border-primary";

export function TestimonialForm({
  token,
  invitedName,
  ownerFirstName,
}: {
  token: string;
  invitedName: string;
  ownerFirstName: string;
}) {
  const [state, formAction, pending] = useActionState(submitTestimonial, INITIAL);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-primary bg-primary-tint p-8 text-center">
        <CircleCheck className="mx-auto size-10 text-primary" aria-hidden />
        <p className="mt-3 text-xl font-semibold">Thank you!</p>
        <p className="mt-2 text-muted">
          Your testimonial was sent to {ownerFirstName}. It means a lot. You can close this page now.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5 rounded-3xl border border-border bg-surface p-6 sm:p-8">
      <input type="hidden" name="token" value={token} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="t-name" className="text-sm font-semibold">
            Your name
          </label>
          <input
            id="t-name"
            name="name"
            required
            autoComplete="name"
            maxLength={TESTIMONIAL_LIMITS.name}
            defaultValue={state.values?.name ?? invitedName}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="t-role" className="text-sm font-semibold">
            Your role and organization <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="t-role"
            name="role"
            maxLength={TESTIMONIAL_LIMITS.role}
            placeholder="e.g. School Principal, or Parent of a former student"
            defaultValue={state.values?.role}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="t-quote" className="text-sm font-semibold">
          Your testimonial
        </label>
        <p className="mt-0.5 text-xs text-muted">
          A few sentences is perfect. For example: what {ownerFirstName} helped with, what working together
          was like, and whether you&apos;d recommend {ownerFirstName}.
        </p>
        <textarea
          id="t-quote"
          name="quote"
          required
          rows={6}
          minLength={TESTIMONIAL_LIMITS.quoteMin}
          maxLength={TESTIMONIAL_LIMITS.quoteMax}
          defaultValue={state.values?.quote}
          className={`${inputClass} resize-y`}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-primary" />
        <span>
          I agree that this testimonial, with my name and role, can be shown on {ownerFirstName}&apos;s
          portfolio website.
        </span>
      </label>

      {state.status === "error" && (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-200">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40 disabled:translate-y-0 disabled:opacity-70"
      >
        {pending ? (
          <>
            Sending <LoaderCircle className="size-4 animate-spin" aria-hidden />
          </>
        ) : (
          <>
            Send testimonial <Send className="size-4" aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
