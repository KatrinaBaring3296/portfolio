import { refresh, updateTag } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CONTENT_TAG } from "@/lib/content";

// Helpers shared by the admin server actions.

/** What every admin action returns, so the page can show a toast. */
export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

export const ok = (message: string): ActionResult => ({ ok: true, message });
export const fail = (message: string): ActionResult => ({ ok: false, message });

/**
 * Call after any change to public content: clears the public site's cache
 * (so visitors see the change on their next page load) and refreshes the
 * admin page you're on.
 */
export function contentChanged() {
  updateTag(CONTENT_TAG);
  refresh();
}

/** Turns a database error into a short, readable message. */
export function dbError(action: string, error: { message: string; code?: string }) {
  console.error(`Admin: ${action} failed:`, error.message);
  if (error.code === "23505")
    return fail(`Couldn't ${action}: that value is already used (it must be unique).`);
  if (error.code === "42501") return fail(`Couldn't ${action}: permission denied. Try logging in again.`);
  return fail(`Couldn't ${action}. ${error.message}`);
}

export { SLUG_PATTERN, slugify, UUID_PATTERN } from "./slug";

/** The sort_order for a new row, so it lands at the bottom of its list. */
export async function nextSortOrder(
  supabase: SupabaseClient,
  table: string,
  filter?: { column: string; value: string },
) {
  let query = supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  if (filter) query = query.eq(filter.column, filter.value);
  const { data } = await query;
  return ((data?.[0]?.sort_order as number | undefined) ?? 0) + 1;
}

/** "linkedin.com/in/you" -> "https://linkedin.com/in/you" (adds https:// when missing). */
export function withHttps(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// ---- Supabase Storage ----

export type Bucket = "images" | "resumes";

function publicPrefix(bucket: Bucket) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`;
}

/** True if the URL points at a file in our own Supabase bucket. */
export function isOwnFileUrl(url: string, bucket: Bucket) {
  return url.startsWith(publicPrefix(bucket));
}

/** Deletes an uploaded file given its public URL. Ignores URLs from elsewhere. */
export async function removeFile(supabase: SupabaseClient, url: string | null | undefined, bucket: Bucket) {
  if (!url || !isOwnFileUrl(url, bucket)) return;
  const path = decodeURIComponent(url.slice(publicPrefix(bucket).length));
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error("Admin: couldn't delete old file:", error.message);
}
