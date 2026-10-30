import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "./supabase/public";
import type {
  Certificate,
  Experience,
  Education,
  Faq,
  FocusProfile,
  Project,
  Service,
  ServiceCategory,
  SiteSettings,
  Skill,
  Status,
  Testimonial,
  WorkSample,
} from "./types";

// Functions the pages call to get their content.
//
// All public content is loaded in one go and cached (it's small). Every admin
// save in Phase 5 calls updateTag(CONTENT_TAG), which clears this cache so the
// change shows up on the very next page load. As a safety net, the cache also
// refreshes on its own about once an hour (e.g. after edits in the Supabase dashboard).
export const CONTENT_TAG = "content";

async function loadContent() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("hours");

  const supabase = createPublicClient();
  // Row Level Security already hides `hidden` rows from visitors.
  const [settings, profiles, categories, services, projects, experience, skills, testimonials] =
    await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("focus_profiles").select("*").order("sort_order"),
      supabase.from("service_categories").select("*").order("sort_order"),
      supabase.from("services").select("*").order("sort_order"),
      supabase.from("projects").select("*").order("sort_order"),
      supabase.from("experience").select("*").order("sort_order"),
      supabase.from("skills").select("*").order("sort_order"),
      supabase.from("testimonials").select("*").order("sort_order"),
    ]);
  const [certificates, faqs, samples, education] = await Promise.all([
    loadAddedLater<Certificate>(supabase, "certificates"),
    loadAddedLater<Faq>(supabase, "faqs"),
    loadAddedLater<WorkSample>(supabase, "work_samples"),
    loadAddedLater<Education>(supabase, "education"),
  ]);

  const firstError = [
    settings,
    profiles,
    categories,
    services,
    projects,
    experience,
    skills,
    testimonials,
  ].find((result) => result.error)?.error;
  if (firstError) {
    throw new Error(`Couldn't load content from Supabase: ${firstError.message}`);
  }
  if (!settings.data) {
    throw new Error("No site settings found. Run supabase/seed.sql in the Supabase SQL Editor.");
  }

  return {
    settings: settings.data as SiteSettings,
    profiles: (profiles.data ?? []) as FocusProfile[],
    categories: (categories.data ?? []) as ServiceCategory[],
    services: (services.data ?? []) as Service[],
    projects: (projects.data ?? []) as Project[],
    experience: (experience.data ?? []) as Experience[],
    skills: (skills.data ?? []) as Skill[],
    testimonials: (testimonials.data ?? []) as Testimonial[],
    certificates,
    faqs,
    samples,
    education,
  };
}

// Tables added after launch (certificates: migration 0002, faqs: 0009, work_samples: 0010,
// education: 0012).
// If that SQL hasn't been run yet, show nothing instead of breaking the site.
async function loadAddedLater<T>(supabase: ReturnType<typeof createPublicClient>, table: string) {
  const { data, error } = await supabase.from(table).select("*").order("sort_order");
  if (error) {
    const missingTable = error.code === "42P01" || error.code === "PGRST205";
    if (missingTable) return [];
    throw new Error(`Couldn't load ${table} from Supabase: ${error.message}`);
  }
  return (data ?? []) as T[];
}

const isPublic = (item: { status: Status }) => item.status !== "hidden";

// Empty show_for means "show on every profile".
const isForProfile = (item: { show_for: string[] }, profileId: string) =>
  item.show_for.length === 0 || item.show_for.includes(profileId);

export async function getSettings() {
  return (await loadContent()).settings;
}

export async function getPublicProfiles() {
  return (await loadContent()).profiles.filter(isPublic);
}

/** The profile for a URL slug, or the default profile when no slug is given. */
export async function getProfile(slug?: string): Promise<FocusProfile | null> {
  const { settings } = await loadContent();
  const profiles = await getPublicProfiles();
  if (!slug) {
    // Falls back to the first profile if the default was hidden or deleted
    return profiles.find((p) => p.id === settings.default_profile_id) ?? profiles[0] ?? null;
  }
  return profiles.find((p) => p.slug === slug) ?? null;
}

/** Everything the homepage needs, tailored to one profile. */
export async function getHomeContent(profile: FocusProfile) {
  const data = await loadContent();

  // Highlighted categories come first (in the profile's chosen order), then the rest.
  const highlighted = profile.highlighted_category_ids;
  const rank = (id: string) => (highlighted.includes(id) ? highlighted.indexOf(id) : highlighted.length);
  const categories = data.categories
    .filter(isPublic)
    .sort((a, b) => rank(a.id) - rank(b.id) || a.sort_order - b.sort_order);

  // A service is shown only if it and its category are both public.
  const categoryIds = new Set(categories.map((c) => c.id));
  const services = data.services.filter((s) => isPublic(s) && categoryIds.has(s.category_id));

  return {
    categories,
    services,
    projects: data.projects.filter((p) => isPublic(p) && isForProfile(p, profile.id)),
    experience: data.experience.filter((e) => isPublic(e) && isForProfile(e, profile.id)),
    skills: data.skills.filter((s) => isPublic(s) && isForProfile(s, profile.id)),
    testimonials: data.testimonials.filter(isPublic),
    certificates: data.certificates.filter((c) => isPublic(c) && isForProfile(c, profile.id)),
    faqs: data.faqs.filter((f) => isPublic(f) && isForProfile(f, profile.id)),
    samples: data.samples.filter((s) => isPublic(s) && isForProfile(s, profile.id)),
    education: data.education.filter((e) => isPublic(e) && isForProfile(e, profile.id)),
  };
}

export async function getProject(slug: string) {
  const { projects } = await loadContent();
  return projects.find((p) => p.slug === slug && isPublic(p)) ?? null;
}

export async function getProjectSlugs() {
  const { projects } = await loadContent();
  return projects.filter(isPublic).map((p) => p.slug);
}

export async function getSample(slug: string) {
  const { samples } = await loadContent();
  return samples.find((s) => s.slug === slug && isPublic(s)) ?? null;
}

export async function getSampleSlugs() {
  const { samples } = await loadContent();
  return samples.filter(isPublic).map((s) => s.slug);
}
