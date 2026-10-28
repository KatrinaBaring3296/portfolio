"use server";

import { requireAdmin } from "@/lib/auth";
import type { SiteSettings, SocialLink } from "@/lib/types";
import {
  type ActionResult,
  contentChanged,
  dbError,
  fail,
  isHttpUrl,
  isOwnFileUrl,
  ok,
  removeFile,
  withHttps,
} from "./shared";

export type SettingsInput = Omit<SiteSettings, "photo_url"> & { photo_url: string | null };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Tidies a list of { label, url } rows (social links, hiring platforms):
 * drops empty rows, adds https:// when missing, and checks each one.
 * Returns the cleaned list, or an error message.
 */
function cleanLinks(links: SocialLink[], max: number, kind: string, example: string): SocialLink[] | string {
  const cleaned = links
    .map((link) => ({ label: link.label.trim(), url: withHttps(link.url) }))
    .filter((link) => link.label || link.url);
  if (cleaned.length > max) return `Up to ${max} ${kind}s.`;
  for (const link of cleaned) {
    if (!link.label) return `Every ${kind} needs a name (e.g. ${example}).`;
    if (link.label.length > 40) return `"${link.label}" is too long for a name (40 characters max).`;
    if (!isHttpUrl(link.url) || !link.url.includes(".")) {
      return `"${link.label}" doesn't look like a valid link.`;
    }
  }
  return cleaned;
}

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  // Check everything on the server, even though the form looks fine in the browser
  const name = input.name.trim();
  const email = input.email.trim();
  if (!name || name.length > 100) return fail("Name is required (100 characters max).");
  if (!EMAIL_PATTERN.test(email)) return fail("Please enter a valid contact email.");
  if (input.about.length > 5000) return fail("About text is too long (5000 characters max).");
  if (input.availability_text.length > 150) return fail("Availability text is too long (150 max).");
  if (input.reply_time_text.length > 150) return fail("Reply-time text is too long (150 max).");
  if (input.photo_url && !isOwnFileUrl(input.photo_url, "images"))
    return fail("Photo must be uploaded here.");

  const socialLinks = cleanLinks(input.social_links, 10, "social link", "LinkedIn");
  if (typeof socialLinks === "string") return fail(socialLinks);

  const platforms = cleanLinks(input.hiring_platforms ?? [], 20, "hiring platform", "Upwork");
  if (typeof platforms === "string") return fail(platforms);

  // Optional "Book a call" link: empty = button hidden
  const availabilityStatus = input.availability_status ?? "available";
  if (!["available", "limited", "booked"].includes(availabilityStatus))
    return fail("Invalid availability status.");

  const bookingUrl = withHttps(input.booking_url ?? "") || null;
  if (bookingUrl && (!isHttpUrl(bookingUrl) || !bookingUrl.includes("."))) {
    return fail("The booking link doesn't look valid.");
  }

  const { data: before } = await supabase.from("site_settings").select("photo_url").eq("id", 1).single();

  const { error } = await supabase
    .from("site_settings")
    .update({
      name,
      email,
      about: input.about.trim(),
      photo_url: input.photo_url,
      social_links: socialLinks,
      availability_text: input.availability_text.trim(),
      reply_time_text: input.reply_time_text.trim(),
      default_profile_id: input.default_profile_id || null,
      booking_url: bookingUrl,
      // Only sent once migration 0009 has added the column
      ...(input.availability_status !== undefined && { availability_status: availabilityStatus }),
      hiring_platforms: platforms,
    })
    .eq("id", 1);
  if (error?.code === "PGRST204") {
    return fail("The hiring platforms field doesn't exist yet. Run supabase/setup.sql in Supabase first.");
  }
  if (error) return dbError("save settings", error);

  // Replaced or removed the photo? Delete the old file so storage stays tidy.
  if (before?.photo_url && before.photo_url !== input.photo_url) {
    await removeFile(supabase, before.photo_url, "images");
  }

  contentChanged();
  return ok("Settings saved.");
}
