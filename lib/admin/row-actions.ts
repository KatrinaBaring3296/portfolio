"use server";

import { requireAdmin } from "@/lib/auth";
import type { Status } from "@/lib/types";
import { type ActionResult, type Bucket, contentChanged, dbError, fail, ok, removeFile } from "./shared";

// Actions every content list shares: change status, reorder, delete.
// `table` comes from the browser, so it's checked against this list first.
const TABLES = [
  "focus_profiles",
  "service_categories",
  "services",
  "projects",
  "experience",
  "skills",
  "testimonials",
  "certificates",
  "faqs",
] as const;
export type ContentTable = (typeof TABLES)[number];

const STATUSES: Status[] = ["active", "coming_soon", "hidden"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isContentTable = (table: string): table is ContentTable =>
  (TABLES as readonly string[]).includes(table);

export async function setStatus(table: ContentTable, id: string, status: Status): Promise<ActionResult> {
  if (!isContentTable(table) || !UUID.test(id) || !STATUSES.includes(status)) return fail("Invalid request.");
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) return dbError("change the status", error);
  contentChanged();
  return ok(`Status set to ${status.replace("_", " ")}.`);
}

/** Saves a new order: `ids` listed top to bottom. */
export async function reorder(table: ContentTable, ids: string[]): Promise<ActionResult> {
  if (!isContentTable(table) || ids.length > 500 || !ids.every((id) => UUID.test(id))) {
    return fail("Invalid request.");
  }
  const { supabase } = await requireAdmin();

  const results = await Promise.all(
    ids.map((id, index) =>
      supabase
        .from(table)
        .update({ sort_order: index + 1 })
        .eq("id", id),
    ),
  );
  const failed = results.find((r) => r.error)?.error;
  if (failed) return dbError("save the new order", failed);
  contentChanged();
  return ok("Order saved.");
}

// Uploaded files that belong to a row, deleted along with it
const FILE_COLUMNS: Partial<Record<ContentTable, { column: string; bucket: Bucket }[]>> = {
  focus_profiles: [{ column: "resume_url", bucket: "resumes" }],
  projects: [
    { column: "cover_image", bucket: "images" },
    { column: "gallery", bucket: "images" },
  ],
  certificates: [{ column: "image_url", bucket: "images" }],
  skills: [{ column: "logo_url", bucket: "images" }],
  experience: [
    { column: "proof", bucket: "images" },
    { column: "proof_images", bucket: "images" }, // older caption-less list
  ],
};

// A file column can hold one URL, a list of URLs (a gallery), or a list of
// { url, caption } items (experience proof). Returns every URL in it.
function urlsIn(value: unknown): (string | null)[] {
  if (!Array.isArray(value)) return [typeof value === "string" ? value : null];
  return value.map((item) =>
    typeof item === "string" ? item : typeof item?.url === "string" ? (item.url as string) : null,
  );
}

export async function deleteRow(table: ContentTable, id: string): Promise<ActionResult> {
  if (!isContentTable(table) || !UUID.test(id)) return fail("Invalid request.");
  const { supabase } = await requireAdmin();

  const fileColumns = FILE_COLUMNS[table] ?? [];
  // select("*") so it still works if a newer file column hasn't been added yet
  const { data: row } = fileColumns.length
    ? await supabase.from(table).select("*").eq("id", id).maybeSingle()
    : { data: null };

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return dbError("delete it", error);

  // Clean up its files
  if (row) {
    for (const { column, bucket } of fileColumns) {
      const urls = urlsIn((row as Record<string, unknown>)[column]);
      await Promise.all(urls.map((url) => removeFile(supabase, url, bucket)));
    }
  }

  contentChanged();
  return ok("Deleted.");
}
