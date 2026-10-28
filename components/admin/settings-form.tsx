"use client";

import { LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { saveSettings, type SettingsInput } from "@/lib/admin/settings-actions";
import { type FocusProfile, hiringPlatforms, type SiteSettings } from "@/lib/types";
import { FileUpload } from "./file-upload";
import { LinkListEditor } from "./link-list-editor";
import { useToast } from "./toast";
import { Card, Field, iconButtonClass, inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";

const AVAILABILITY_OPTIONS = [
  {
    value: "available",
    label: "Available",
    dot: "bg-emerald-500",
    example: "Available for work · Flexible hours",
  },
  {
    value: "limited",
    label: "Limited",
    dot: "bg-amber-500",
    example: "Limited availability · Part-time only",
  },
  { value: "booked", label: "Booked", dot: "bg-slate-400", example: "Fully booked until December" },
] as const;

export function SettingsForm({
  settings,
  profiles,
}: {
  settings: SiteSettings;
  profiles: Pick<FocusProfile, "id" | "label" | "status">[];
}) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  // Before migration 0004, show the old Upwork/OnlineJobs links as list rows
  const [form, setForm] = useState<SettingsInput>({
    ...settings,
    hiring_platforms: hiringPlatforms(settings),
  });

  // Update one field, keep the rest
  const set = <K extends keyof SettingsInput>(key: K, value: SettingsInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const setLink = (index: number, key: "label" | "url", value: string) =>
    set(
      "social_links",
      form.social_links.map((link, i) => (i === index ? { ...link, [key]: value } : link)),
    );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveSettings(form);
      toast(result.message, result.ok ? "success" : "error");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="space-y-5">
        <h2 className="font-semibold">You</h2>
        <Field label="Photo" hint="Shown in the hero section. A portrait (4:5) photo looks best.">
          <FileUpload
            bucket="images"
            folder="profile"
            value={form.photo_url}
            onChange={(url) => set("photo_url", url)}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input
              id="name"
              required
              maxLength={100}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Contact email" htmlFor="email" hint="Shown publicly on the site.">
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="About" htmlFor="about" hint="Leave a blank line between paragraphs.">
          <textarea
            id="about"
            rows={7}
            maxLength={5000}
            value={form.about}
            onChange={(e) => set("about", e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </Field>
      </Card>

      <Card className="space-y-5">
        <h2 className="font-semibold">Badges and homepage</h2>
        <fieldset>
          <legend className="text-sm font-semibold">Availability status</legend>
          <p className="text-xs text-muted">
            Sets the color of the badge&apos;s dot. Update the badge text below to match.
          </p>
          <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
            {AVAILABILITY_OPTIONS.map((o) => (
              <label
                key={o.value}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary ${
                  (form.availability_status ?? "available") === o.value
                    ? "border-primary bg-primary-tint"
                    : "border-border hover:border-primary"
                }`}
              >
                <input
                  type="radio"
                  name="availability_status"
                  value={o.value}
                  checked={(form.availability_status ?? "available") === o.value}
                  onChange={() => set("availability_status", o.value)}
                  className="sr-only"
                />
                <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${o.dot}`} aria-hidden />
                <span>
                  <span className="block font-semibold">{o.label}</span>
                  <span className="block text-xs text-muted">e.g. &quot;{o.example}&quot;</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Availability badge" htmlFor="availability" hint="The small badge above your headline.">
          <input
            id="availability"
            maxLength={150}
            value={form.availability_text}
            onChange={(e) => set("availability_text", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Reply time" htmlFor="reply" hint="Shown next to the contact form.">
          <input
            id="reply"
            maxLength={150}
            value={form.reply_time_text}
            onChange={(e) => set("reply_time_text", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="Default profile"
          htmlFor="default-profile"
          hint="Which profile visitors see at your main URL (/)."
        >
          <select
            id="default-profile"
            value={form.default_profile_id ?? ""}
            onChange={(e) => set("default_profile_id", e.target.value || null)}
            className={inputClass}
          >
            <option value="">(first visible profile)</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
                {p.status === "hidden" ? " (hidden)" : ""}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card className="space-y-5">
        <div>
          <h2 className="font-semibold">Hiring links</h2>
          <p className="text-sm text-muted">Optional. Each one becomes a button on your site.</p>
        </div>
        <Field
          label="Booking link"
          htmlFor="booking-url"
          hint='Your Calendly (or similar) page. Adds a "Book a call" button next to "Hire me". Leave empty to hide it.'
        >
          <input
            id="booking-url"
            inputMode="url"
            placeholder="calendly.com/your-name/30min"
            value={form.booking_url ?? ""}
            onChange={(e) => set("booking_url", e.target.value)}
            className={inputClass}
          />
        </Field>
        <div>
          <h3 className="text-sm font-semibold">Hiring platforms</h3>
          <p className="mb-3 text-xs text-muted">
            Each becomes a &quot;Hire me on …&quot; button in the Contact section, in this order. Paste your
            public profile link for each.
          </p>
          <LinkListEditor
            id="platform"
            value={form.hiring_platforms ?? []}
            onChange={(links) => set("hiring_platforms", links)}
            presets={["Upwork", "OnlineJobs.ph", "VirtualStaff.ph", "Freelancer.com", "Fiverr", "Contra"]}
            namePlaceholder="VirtualStaff.ph"
            linkPlaceholder="virtualstaff.ph/your-profile"
            addLabel="Add platform"
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="font-semibold">Social links</h2>
          <p className="text-sm text-muted">Shown in the contact section and footer.</p>
        </div>
        {form.social_links.map((link, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3 sm:flex-nowrap">
            <div className="w-full sm:w-40">
              <label htmlFor={`link-label-${i}`} className="text-xs font-semibold">
                Label
              </label>
              <input
                id={`link-label-${i}`}
                placeholder="LinkedIn"
                maxLength={40}
                value={link.label}
                onChange={(e) => setLink(i, "label", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor={`link-url-${i}`} className="text-xs font-semibold">
                Link
              </label>
              <input
                id={`link-url-${i}`}
                // Plain text (not type="url") so "linkedin.com/in/you" is accepted;
                // the server adds https:// when it's missing.
                type="text"
                inputMode="url"
                autoComplete="url"
                placeholder="linkedin.com/in/your-name"
                value={link.url}
                onChange={(e) => setLink(i, "url", e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="button"
              aria-label={`Remove ${link.label || "link"}`}
              onClick={() =>
                set(
                  "social_links",
                  form.social_links.filter((_, j) => j !== i),
                )
              }
              className={iconButtonClass}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("social_links", [...form.social_links, { label: "", url: "" }])}
          className={secondaryButtonClass}
        >
          <Plus className="size-4" aria-hidden /> Add link
        </button>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <button type="submit" disabled={pending} className={`${primaryButtonClass} shadow-lg`}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
