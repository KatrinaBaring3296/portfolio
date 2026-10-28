import type { Metadata } from "next";
import type { FocusProfile, Project, SiteSettings } from "./types";

// Search-engine and link-preview info (what Google, LinkedIn, Messenger,
// etc. show for your links).

/** Your live site address, from NEXT_PUBLIC_SITE_URL in .env.local / Vercel. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

// Placeholder text like "[Headline for General VA]" shouldn't reach Google
const isPlaceholder = (text: string) => !text.trim() || /^\[.*\]$/.test(text.trim());

function describe(profile: FocusProfile, settings: SiteSettings) {
  if (!isPlaceholder(profile.pitch)) return profile.pitch;
  return `${settings.name}: ${profile.label} based in the Philippines (UTC+8).`;
}

/** Metadata for a homepage ("/" or "/for/[profile]"). */
export function profileMetadata(profile: FocusProfile, settings: SiteSettings, isDefault: boolean): Metadata {
  const title = `${settings.name} | ${profile.label}`;
  const description = describe(profile, settings);
  // The default profile lives at "/"; its /for/ copy points search engines there
  // so they don't treat the two as duplicate pages.
  const url = isDefault ? "/" : `/for/${profile.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { type: "profile", title, description, url, siteName: settings.name, locale: "en_PH" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Metadata for a project page. */
export function projectMetadata(project: Project, settings: SiteSettings): Metadata {
  const title = `${project.title} | ${settings.name}`;
  const description = isPlaceholder(project.summary) ? `A project by ${settings.name}.` : project.summary;
  const url = `/projects/${project.slug}`;
  const images = project.cover_image ? [{ url: project.cover_image, alt: project.title }] : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url, siteName: settings.name, images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description },
  };
}
