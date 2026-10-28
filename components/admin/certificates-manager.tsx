"use client";

import { Award, Pencil, Plus, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type CertificateInput, saveCertificate } from "@/lib/admin/content-actions";
import type { Certificate } from "@/lib/types";
import { EditorDialog, FormFooter } from "./editor-dialog";
import { FileUpload } from "./file-upload";
import { DeleteButton, MoveButtons, StatusSelect, useAction } from "./row-controls";
import { type ProfileOption, ShowForPicker, showForLabel } from "./show-for-picker";
import { StatusRadio } from "./status-radio";
import { Field, iconButtonClass, inputClass, primaryButtonClass } from "./ui";
import { watermarkImage } from "./watermark";

const EMPTY: CertificateInput = {
  title: "",
  issuer: "",
  credential_id: "",
  issue_date: "",
  expiry_date: "",
  credential_url: "",
  image_url: null,
  status: "active",
  show_for: [],
};

// Database rows use null for empty fields; the form uses ""
const toInput = (c: Certificate): CertificateInput => ({
  id: c.id,
  title: c.title,
  issuer: c.issuer,
  credential_id: c.credential_id ?? "",
  issue_date: c.issue_date ?? "",
  expiry_date: c.expiry_date ?? "",
  credential_url: c.credential_url ?? "",
  image_url: c.image_url,
  status: c.status,
  show_for: c.show_for,
});

export function CertificatesManager({
  certificates,
  profiles,
  ownerName,
  tableMissing,
}: {
  certificates: Certificate[];
  profiles: ProfileOption[];
  ownerName: string; // stamped on the preview images
  tableMissing: boolean;
}) {
  const [editing, setEditing] = useState<CertificateInput | null>(null);
  const ids = certificates.map((c) => c.id);

  if (tableMissing) {
    return (
      <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        One-time setup needed: run <code className="font-mono">supabase/setup.sql</code> in the Supabase SQL
        Editor, then refresh this page.
      </p>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setEditing(EMPTY)} className={primaryButtonClass}>
          <Plus className="size-4" aria-hidden /> Add certificate
        </button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {certificates.map((c, i) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-primary-tint text-primary-dark">
              {c.image_url ? (
                <Image src={c.image_url} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <Award className="size-5" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.title}</p>
              <p className="truncate text-xs text-muted">
                {[c.issuer, c.credential_id && `ID ${c.credential_id}`, showForLabel(c.show_for, profiles)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <StatusSelect table="certificates" id={c.id} status={c.status} label={`Status of ${c.title}`} />
            <div className="flex items-center">
              <MoveButtons table="certificates" ids={ids} index={i} label={c.title} />
              <button
                type="button"
                onClick={() => setEditing(toInput(c))}
                aria-label={`Edit ${c.title}`}
                className={iconButtonClass}
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <DeleteButton
                table="certificates"
                id={c.id}
                label={c.title}
                description="Its preview image is deleted too (your original file on your computer isn't affected)."
              />
            </div>
          </li>
        ))}
        {certificates.length === 0 && (
          <li className="p-8 text-center text-muted">
            No certificates yet. The section stays hidden until you add one.
          </li>
        )}
      </ul>
      <p className="mt-3 text-xs text-muted">
        Tip: set a certificate you&apos;re still working on to &quot;Coming soon&quot;. It shows an &quot;In
        progress&quot; badge.
      </p>

      <EditorDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit certificate" : "Add certificate"}
      >
        {editing && (
          <CertificateForm
            initial={editing}
            profiles={profiles}
            ownerName={ownerName}
            onDone={() => setEditing(null)}
          />
        )}
      </EditorDialog>
    </>
  );
}

function CertificateForm({
  initial,
  profiles,
  ownerName,
  onDone,
}: {
  initial: CertificateInput;
  profiles: ProfileOption[];
  ownerName: string;
  onDone: () => void;
}) {
  const [form, setForm] = useState<CertificateInput>(initial);
  const { run, pending } = useAction();
  const set = <K extends keyof CertificateInput>(key: K, value: CertificateInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(async () => {
          const result = await saveCertificate(form);
          if (result.ok) onDone();
          return result;
        });
      }}
      className="space-y-5"
    >
      <Field
        label="Certificate name"
        htmlFor="ce-title"
        hint="e.g. Google IT Support Professional Certificate"
      >
        <input
          id="ce-title"
          required
          maxLength={160}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Issued by" htmlFor="ce-issuer" hint="e.g. Coursera, TESDA, Cisco">
          <input
            id="ce-issuer"
            maxLength={120}
            value={form.issuer}
            onChange={(e) => set("issuer", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Credential ID" htmlFor="ce-id" hint="The ID or number printed on it. Optional.">
          <input
            id="ce-id"
            maxLength={120}
            value={form.credential_id}
            onChange={(e) => set("credential_id", e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </Field>
        <Field label="Date issued" htmlFor="ce-issued" hint="Only the month and year are shown.">
          <input
            id="ce-issued"
            type="date"
            value={form.issue_date}
            onChange={(e) => set("issue_date", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Expiry date" htmlFor="ce-expiry" hint="Leave empty if it doesn't expire.">
          <input
            id="ce-expiry"
            type="date"
            min={form.issue_date || undefined}
            value={form.expiry_date}
            onChange={(e) => set("expiry_date", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Verification link"
        htmlFor="ce-url"
        hint="Where employers can confirm it's real (e.g. your Coursera or Credly credential page). Optional."
      >
        <input
          id="ce-url"
          inputMode="url"
          placeholder="coursera.org/verify/ABC123"
          value={form.credential_url}
          onChange={(e) => set("credential_url", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Certificate picture">
        <div className="mt-1.5 flex gap-2 rounded-lg border border-border bg-primary-tint p-3 text-xs">
          <ShieldCheck className="size-4 shrink-0 text-primary-dark" aria-hidden />
          <p>
            Your original stays on your computer. Before uploading, the site makes a smaller copy with &quot;
            {ownerName || "your name"} · portfolio preview&quot; stamped across it, and only that copy goes
            online. Visitors can view it but there&apos;s no download button.
            <br />
            <span className="text-muted">
              Have a PDF? Open it, press <kbd className="font-mono">Win + Shift + S</kbd> to screenshot it,
              save the screenshot, and upload that.
            </span>
          </p>
        </div>
        <FileUpload
          bucket="images"
          folder="certificates"
          value={form.image_url}
          onChange={(url) => set("image_url", url)}
          label="Upload certificate"
          transform={(file) => watermarkImage(file, ownerName)}
        />
      </Field>

      <ShowForPicker profiles={profiles} value={form.show_for} onChange={(ids) => set("show_for", ids)} />
      <StatusRadio value={form.status} onChange={(status) => set("status", status)} />
      <FormFooter pending={pending} onCancel={onDone} saveLabel={form.id ? "Save" : "Add certificate"} />
    </form>
  );
}
