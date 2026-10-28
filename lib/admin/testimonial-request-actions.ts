"use server";

import { randomBytes } from "node:crypto";
import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { SITE_URL } from "@/lib/seo";
import { type ActionResult, dbError, fail, UUID_PATTERN } from "./shared";

/** Creates a private, single-use testimonial link for one person. */
export async function createTestimonialRequest(name: string): Promise<ActionResult & { url?: string }> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 100) return fail("Enter the person's name (100 characters max).");
  const { supabase } = await requireAdmin();

  // 18 random bytes = a 24-character code nobody can guess
  const token = randomBytes(18).toString("base64url");
  const { error } = await supabase.from("testimonial_requests").insert({ token, name: trimmed });
  if (error?.code === "42P01" || error?.code === "PGRST205") {
    return fail("Run supabase/setup.sql in Supabase first.");
  }
  if (error) return dbError("create the link", error);

  refresh();
  return {
    ok: true,
    message: `Link created for ${trimmed}. Copy it and send it to them.`,
    url: `${SITE_URL}/review/${token}`,
  };
}

/** Cancels a link that hasn't been used yet (it stops working). */
export async function cancelTestimonialRequest(id: string): Promise<ActionResult> {
  if (!UUID_PATTERN.test(id)) return fail("Invalid request.");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("testimonial_requests").delete().eq("id", id);
  if (error) return dbError("cancel the link", error);
  refresh();
  return { ok: true, message: "Link cancelled." };
}
