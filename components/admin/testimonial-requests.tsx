"use client";

import { Check, Copy, Link2, LoaderCircle, Send } from "lucide-react";
import { useState } from "react";
import { cancelTestimonialRequest, createTestimonialRequest } from "@/lib/admin/testimonial-request-actions";
import { ConfirmButton } from "./confirm-button";
import { useAction } from "./row-controls";
import { useToast } from "./toast";
import { Card, iconButtonClass, inputClass, primaryButtonClass } from "./ui";

export type RequestRow = {
  id: string;
  name: string;
  url: string;
  created_at: string;
  used_at: string | null;
};

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "Asia/Manila" });

// "Request a testimonial": create a private single-use link, copy it, send it.
export function TestimonialRequests({
  requests,
  tableMissing,
}: {
  requests: RequestRow[];
  tableMissing: boolean;
}) {
  const toast = useToast();
  const { run, pending } = useAction();
  const [name, setName] = useState("");
  const [created, setCreated] = useState<{ name: string; url: string } | null>(null);

  if (tableMissing) {
    return (
      <p className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        To send testimonial request links, run <code className="font-mono">supabase/setup.sql</code> in the
        Supabase SQL Editor, then refresh this page.
      </p>
    );
  }

  const waiting = requests.filter((r) => !r.used_at);
  const used = requests.filter((r) => r.used_at);

  return (
    <Card className="mb-8 space-y-5">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <Send className="size-4 text-primary" aria-hidden /> Request a testimonial
        </h2>
        <p className="mt-1 text-sm text-muted">
          Creates a private link that works once. Send it by email or chat; what they write arrives below as
          Hidden, so you can read it before setting it to Active.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const result = await createTestimonialRequest(name);
            if (result.ok && result.url) {
              setCreated({ name: name.trim(), url: result.url });
              setName("");
            }
            return result;
          });
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="min-w-0 flex-1">
          <label htmlFor="request-name" className="text-xs font-semibold">
            Their name
          </label>
          <input
            id="request-name"
            required
            maxLength={100}
            placeholder="e.g. Engr. Maria Santos"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <Link2 className="size-4" aria-hidden />
          )}
          Create link
        </button>
      </form>

      {created && (
        <div className="rounded-xl border border-primary bg-primary-tint p-4">
          <p className="text-sm font-semibold">Link for {created.name}:</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs break-all">
              {created.url}
            </code>
            <CopyButton
              text={created.url}
              onCopied={() => toast("Link copied. Paste it into your message.")}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Example message: &quot;Hi! I&apos;m building my portfolio. Would you mind writing a short
            testimonial about working with me? It takes 2 minutes: {created.url}&quot;
          </p>
        </div>
      )}

      {requests.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <RequestList
            title={`Waiting (${waiting.length})`}
            rows={waiting}
            onCancel={(id) => run(() => cancelTestimonialRequest(id))}
          />
          <RequestList title={`Used (${used.length})`} rows={used} />
        </div>
      )}
    </Card>
  );
}

function RequestList({
  title,
  rows,
  onCancel,
}: {
  title: string;
  rows: RequestRow[];
  onCancel?: (id: string) => void;
}) {
  const toast = useToast();
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-2 px-3 py-2 text-sm">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.name}</p>
              <p className="text-xs text-muted">
                {r.used_at
                  ? `Submitted ${dateFormat.format(new Date(r.used_at))}`
                  : `Sent ${dateFormat.format(new Date(r.created_at))}`}
              </p>
            </div>
            {onCancel && (
              <>
                <CopyButton text={r.url} onCopied={() => toast("Link copied.")} compact />
                <ConfirmButton
                  title={`Cancel the link for ${r.name}?`}
                  description="The link will stop working. You can always create a new one."
                  confirmLabel="Cancel link"
                  onConfirm={() => onCancel(r.id)}
                  className={`${iconButtonClass} text-xs`}
                >
                  ✕<span className="sr-only">Cancel link for {r.name}</span>
                </ConfirmButton>
              </>
            )}
          </li>
        ))}
        {rows.length === 0 && <li className="px-3 py-4 text-center text-xs text-muted">None</li>}
      </ul>
    </div>
  );
}

function CopyButton({
  text,
  onCopied,
  compact = false,
}: {
  text: string;
  onCopied: () => void;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onCopied();
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label="Copy link"
      className={compact ? iconButtonClass : `${primaryButtonClass} py-2`}
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {!compact && (copied ? "Copied" : "Copy link")}
    </button>
  );
}
