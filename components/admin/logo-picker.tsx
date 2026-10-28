"use client";

import { Ban, LoaderCircle, Search, Sparkles } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { SkillLogo } from "@/components/public/skill-logo";
import { searchLogos } from "@/lib/admin/logo-actions";
import type { SkillLogo as Logo } from "@/lib/types";
import { FileUpload } from "./file-upload";
import { inputClass } from "./ui";

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");

export type LogoChoice = { icon: string | null; logo_url: string | null };

// Choose a skill's logo: search the logo library, upload an image, use the
// automatic match by name, or show no logo at all.
export function LogoPicker({
  skillName,
  value,
  onChange,
  initialLogo,
}: {
  skillName: string;
  value: LogoChoice;
  onChange: (choice: LogoChoice) => void;
  initialLogo: Logo | null; // what's saved now, for the preview
}) {
  const [query, setQuery] = useState(skillName);
  const [results, setResults] = useState<{ slug: string; logo: Logo }[]>([]);
  const [preview, setPreview] = useState<Logo | null>(initialLogo);
  const [searching, startSearch] = useTransition();

  // Search as you type (after a short pause)
  useEffect(() => {
    const timer = setTimeout(() => {
      startSearch(async () => setResults(query.trim() ? await searchLogos(query) : []));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const mode = value.logo_url ? "upload" : value.icon === "none" ? "none" : value.icon ? "library" : "auto";
  const description = {
    upload: "Uploaded image",
    library: "From the logo library",
    auto: preview ? "Matched automatically by name" : "No match found by name: search below, or upload one",
    none: "No logo: shown as a text chip",
  }[mode];

  return (
    <div className="mt-1.5 space-y-4 rounded-xl border border-border p-4">
      {/* Current choice */}
      <div className="flex items-center gap-3">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background">
          {mode !== "none" && preview ? (
            <SkillLogo logo={preview} className="size-8" />
          ) : (
            <Ban className="size-5 text-muted" aria-hidden />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{description}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {mode !== "auto" && (
              <button
                type="button"
                onClick={() => {
                  onChange({ icon: null, logo_url: null });
                  // Show what the automatic match by name will be (same rule as the site)
                  startSearch(async () => {
                    const [best] = await searchLogos(skillName);
                    const exact =
                      best?.logo.kind === "brand" && normalize(best.logo.title) === normalize(skillName);
                    setPreview(exact ? best.logo : null);
                  });
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:underline"
              >
                <Sparkles className="size-3" aria-hidden /> Match automatically
              </button>
            )}
            {mode !== "none" && (
              <button
                type="button"
                onClick={() => onChange({ icon: "none", logo_url: null })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:underline"
              >
                <Ban className="size-3" aria-hidden /> No logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Library search */}
      <div>
        <label htmlFor="logo-search" className="text-xs font-semibold">
          Search the logo library
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 mt-0.75 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            id="logo-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Gmail, Trello, Python"
            className={`${inputClass} pl-9`}
          />
          {searching && (
            <LoaderCircle
              className="absolute top-1/2 right-3 mt-0.75 size-4 -translate-y-1/2 animate-spin text-muted"
              aria-hidden
            />
          )}
        </div>
        {results.length > 0 ? (
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {results.map(({ slug, logo }) => (
              <li key={slug}>
                <button
                  type="button"
                  onClick={() => {
                    onChange({ icon: slug, logo_url: null });
                    setPreview(logo);
                  }}
                  aria-pressed={value.icon === slug}
                  className={`flex w-full flex-col items-center gap-1.5 rounded-lg border p-2 text-center text-xs transition-colors ${
                    value.icon === slug
                      ? "border-primary bg-primary-tint"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <SkillLogo logo={logo} className="size-6" />
                  <span className="line-clamp-1">{logo.kind === "brand" ? logo.title : slug}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          query.trim() &&
          !searching && (
            <p className="mt-2 text-xs text-muted">
              Not in the library. Some brands (Canva, Slack, ChatGPT, Microsoft) aren&apos;t included; upload
              their logo below instead.
            </p>
          )
        )}
      </div>

      {/* Upload */}
      <div>
        <p className="text-xs font-semibold">Or upload a logo image</p>
        <p className="text-xs text-muted">A square PNG with a transparent background looks best.</p>
        <FileUpload
          bucket="images"
          folder="logos"
          value={value.logo_url}
          label="Upload logo"
          onChange={(url) => {
            onChange({ icon: url ? null : value.icon, logo_url: url });
            setPreview(url ? { kind: "image", url } : null);
          }}
        />
      </div>
    </div>
  );
}
