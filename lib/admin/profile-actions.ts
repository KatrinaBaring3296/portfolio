"use server";

import { requireAdmin } from "@/lib/auth";
import { ALL_SECTIONS, type SectionKey, type Status } from "@/lib/types";
import {
  type ActionResult,
  contentChanged,
  dbError,
  fail,
  isOwnFileUrl,
  nextSortOrder,
  ok,
  removeFile,
  SLUG_PATTERN,
  slugify,
  UUID_PATTERN,
} from "./shared";

const STATUSES: Status[] = ["active", "coming_soon", "hidden"];
const SECTIONS = ALL_SECTIONS;

export type ProfileInput = {
  id?: string; // missing = new profile
  label: string;
  slug: string;
  headline: string;
  pitch: string;
  status: Status;
  resume_url: string | null;
  highlighted_category_ids: string[];
  section_order: SectionKey[];
};

export async function saveProfile(input: ProfileInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const label = input.label.trim();
  const slug = input.slug.trim() || slugify(label);
  if (!label || label.length > 60) return fail("Label is required (60 characters max).");
  if (!SLUG_PATTERN.test(slug)) return fail("URL name can only use lowercase letters, numbers, and dashes.");
  if (input.headline.length > 200) return fail("Headline is too long (200 max).");
  if (input.pitch.length > 600) return fail("Pitch is too long (600 max).");
  if (!STATUSES.includes(input.status)) return fail("Invalid status.");
  if (input.id && !UUID_PATTERN.test(input.id)) return fail("Invalid request.");
  if (input.resume_url && !isOwnFileUrl(input.resume_url, "resumes"))
    return fail("Résumé must be uploaded here.");
  if (
    input.highlighted_category_ids.length > 20 ||
    !input.highlighted_category_ids.every((id) => UUID_PATTERN.test(id))
  ) {
    return fail("Invalid highlighted categories.");
  }
  // Section order must list every section exactly once
  const sections = input.section_order;
  if (sections.length !== SECTIONS.length || !SECTIONS.every((s) => sections.includes(s))) {
    return fail("Invalid section order.");
  }

  const values = {
    label,
    slug,
    headline: input.headline.trim(),
    pitch: input.pitch.trim(),
    status: input.status,
    resume_url: input.resume_url,
    highlighted_category_ids: input.highlighted_category_ids,
    section_order: sections,
  };

  let oldResume: string | null = null;
  let error;
  if (input.id) {
    const { data: before } = await supabase
      .from("focus_profiles")
      .select("resume_url")
      .eq("id", input.id)
      .single();
    oldResume = before?.resume_url ?? null;
    ({ error } = await supabase.from("focus_profiles").update(values).eq("id", input.id));
  } else {
    ({ error } = await supabase
      .from("focus_profiles")
      .insert({ ...values, sort_order: await nextSortOrder(supabase, "focus_profiles") }));
  }
  if (error) {
    if (error.code === "23505") return fail(`Another profile already uses the URL /for/${slug}.`);
    return dbError("save the profile", error);
  }

  // Replaced or removed the résumé? Delete the old PDF.
  if (oldResume && oldResume !== input.resume_url) await removeFile(supabase, oldResume, "resumes");

  contentChanged();
  return ok(input.id ? "Profile saved." : "Profile added.");
}

/** Makes this profile the one shown at "/". */
export async function setDefaultProfile(id: string): Promise<ActionResult> {
  if (!UUID_PATTERN.test(id)) return fail("Invalid request.");
  const { supabase } = await requireAdmin();

  const { data: profile } = await supabase
    .from("focus_profiles")
    .select("label, status")
    .eq("id", id)
    .single();
  if (!profile) return fail("Profile not found.");
  if (profile.status === "hidden") return fail("Make this profile visible before setting it as the default.");

  const { error } = await supabase.from("site_settings").update({ default_profile_id: id }).eq("id", 1);
  if (error) return dbError("set the default profile", error);

  contentChanged();
  return ok(`${profile.label} is now shown at your main URL.`);
}
