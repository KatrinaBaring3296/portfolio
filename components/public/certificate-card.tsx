"use client";

import { Award, BadgeCheck, ExternalLink, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";
import type { Certificate } from "@/lib/types";
import { ComingSoonBadge } from "./badges";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2025-06-01" -> "Jun 2025" (done by hand to avoid time-zone surprises)
function formatMonth(date: string) {
  const [year, month] = date.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

// Today's date as "2026-10-20", read in the browser only. While the page is
// built on the server this is null, so the "Expired" check never goes stale.
const noop = () => () => {};
function useToday() {
  return useSyncExternalStore(
    noop,
    () => new Date().toISOString().slice(0, 10),
    () => null,
  );
}

// Stops the easy ways to save the picture (right-click > Save, dragging it out).
// The image itself is a watermarked, reduced copy, so even a screenshot isn't
// a usable certificate. Real proof is the credential ID / verify link.
const noSave = {
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  onDragStart: (e: React.DragEvent) => e.preventDefault(),
};

export function CertificateCard({ certificate: c }: { certificate: Certificate }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const today = useToday();
  const expired = !!(today && c.expiry_date && c.expiry_date < today);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface transition hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
      {c.image_url ? (
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          aria-label={`View ${c.title} certificate`}
          className="group relative aspect-4/3 overflow-hidden bg-primary-tint select-none"
          {...noSave}
        >
          <Image
            src={c.image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
            draggable={false}
            className="pointer-events-none object-contain p-3 transition-transform group-hover:scale-[1.03]"
          />
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium shadow-sm">
            <Maximize2 className="size-3" aria-hidden /> View
          </span>
        </button>
      ) : (
        <div className="flex aspect-4/3 items-center justify-center bg-primary-tint text-primary-dark">
          <Award className="size-12 opacity-70" aria-hidden />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{c.title}</h3>
          {c.status === "coming_soon" && <ComingSoonBadge label="In progress" />}
        </div>
        {c.issuer && <p className="mt-0.5 text-sm font-medium text-primary-dark">{c.issuer}</p>}
        <CertificateDetails certificate={c} expired={expired} />
      </div>

      {c.image_url && (
        <dialog
          ref={dialogRef}
          aria-label={`${c.title} certificate`}
          className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-3xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/70"
          // Click on the dimmed background closes it
          onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        >
          <div className="flex items-start justify-between gap-4 p-5 pb-0">
            <div>
              <h3 className="text-lg font-bold">{c.title}</h3>
              {c.issuer && <p className="text-sm text-primary-dark">{c.issuer}</p>}
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-primary-tint hover:text-foreground"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div
            className="relative m-5 aspect-4/3 overflow-hidden rounded-xl bg-primary-tint select-none"
            {...noSave}
          >
            <Image
              src={c.image_url}
              alt={`${c.title} certificate (preview copy)`}
              fill
              sizes="(min-width: 896px) 856px, 100vw"
              draggable={false}
              className="pointer-events-none object-contain"
            />
          </div>
          <div className="px-5 pb-5">
            <CertificateDetails certificate={c} expired={expired} />
            <p className="mt-4 text-xs text-muted">
              Preview copy only. To confirm this certificate, use the credential ID or verification link.
            </p>
          </div>
        </dialog>
      )}
    </article>
  );
}

function CertificateDetails({ certificate: c, expired }: { certificate: Certificate; expired: boolean }) {
  return (
    <>
      <dl className="mt-4 space-y-1.5 text-sm">
        {c.issue_date && <Detail label="Issued">{formatMonth(c.issue_date)}</Detail>}
        <Detail label="Expires">
          {c.expiry_date ? (
            <span className={expired ? "font-medium text-red-700 dark:text-red-200" : undefined}>
              {formatMonth(c.expiry_date)}
              {expired && " (expired)"}
            </span>
          ) : (
            "No expiration"
          )}
        </Detail>
        {c.credential_id && (
          <Detail label="Credential ID">
            <span className="font-mono text-xs break-all">{c.credential_id}</span>
          </Detail>
        )}
      </dl>
      {c.credential_url && (
        <a
          href={c.credential_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary-dark hover:underline"
        >
          <BadgeCheck className="size-4" aria-hidden /> Verify credential
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      )}
    </>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
