"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";
import { isBrandIcon } from "@/lib/brand-icons";
import {
  type Experience,
  type ExperienceCategory,
  experienceProof,
  type ProofItem,
  type SampleItem,
  type SkillGroup,
  type Status,
} from "@/lib/types";
import {
  type ActionResult,
  contentChanged,
  dbError,
  fail,
  isHttpUrl,
  isOwnFileUrl,
  nextSortOrder,
  ok,
  removeFile,
  SLUG_PATTERN,
  slugify,
  UUID_PATTERN,
  withHttps,
} from "./shared";

// Save (create or update) projects, experience, skills, and testimonials.

const STATUSES: Status[] = ["active", "coming_soon", "hidden"];

/** Shared checks; returns an error message, or null if fine. */
function checkCommon(input: { id?: string; status: Status; show_for?: string[] }) {
  if (input.id && !UUID_PATTERN.test(input.id)) return "Invalid request.";
  if (!STATUSES.includes(input.status)) return "Invalid status.";
  if (
    input.show_for &&
    (input.show_for.length > 50 || !input.show_for.every((id) => UUID_PATTERN.test(id)))
  ) {
    return "Invalid profile selection.";
  }
  return null;
}

/** Insert a new row at the bottom of its list, or update an existing one. */
async function upsert(
  supabase: SupabaseClient,
  table: string,
  id: string | undefined,
  values: Record<string, unknown>,
  sortFilter?: { column: string; value: string },
) {
  return id
    ? supabase.from(table).update(values).eq("id", id)
    : supabase
        .from(table)
        .insert({ ...values, sort_order: await nextSortOrder(supabase, table, sortFilter) });
}

// ---- Projects ----

export type ProjectInput = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tech_stack: string[];
  cover_image: string | null;
  gallery: string[];
  github_url: string;
  demo_url: string;
  featured: boolean;
  status: Status;
  show_for: string[];
};

export async function saveProject(input: ProjectInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const problem = checkCommon(input);
  if (problem) return fail(problem);

  const title = input.title.trim();
  const slug = input.slug.trim() || slugify(title);
  const githubUrl = withHttps(input.github_url);
  const demoUrl = withHttps(input.demo_url);
  const techStack = [...new Set(input.tech_stack.map((t) => t.trim()).filter(Boolean))];

  if (!title || title.length > 120) return fail("Title is required (120 characters max).");
  if (!SLUG_PATTERN.test(slug)) return fail("URL name can only use lowercase letters, numbers, and dashes.");
  if (input.summary.length > 300) return fail("Summary is too long (300 max).");
  if (input.content.length > 20000) return fail("Description is too long (20,000 max).");
  if (techStack.length > 20 || techStack.some((t) => t.length > 40))
    return fail("Up to 20 tech tags, 40 characters each.");
  if (githubUrl && !isHttpUrl(githubUrl)) return fail("GitHub link doesn't look valid.");
  if (demoUrl && !isHttpUrl(demoUrl)) return fail("Demo link doesn't look valid.");
  if (input.cover_image && !isOwnFileUrl(input.cover_image, "images"))
    return fail("Cover must be uploaded here.");
  if (input.gallery.length > 20 || !input.gallery.every((url) => isOwnFileUrl(url, "images"))) {
    return fail("Gallery images must be uploaded here (20 max).");
  }

  // Remember the old images so we can delete ones that were removed
  const { data: before } = input.id
    ? await supabase.from("projects").select("cover_image, gallery").eq("id", input.id).single()
    : { data: null };

  const { error } = await upsert(supabase, "projects", input.id, {
    title,
    slug,
    summary: input.summary.trim(),
    content: input.content.trim(),
    tech_stack: techStack,
    cover_image: input.cover_image,
    gallery: input.gallery,
    github_url: githubUrl || null,
    demo_url: demoUrl || null,
    featured: input.featured,
    status: input.status,
    show_for: input.show_for,
  });
  if (error) {
    if (error.code === "23505") return fail(`Another project already uses the URL /projects/${slug}.`);
    return dbError("save the project", error);
  }

  if (before) {
    const stillUsed = new Set([input.cover_image, ...input.gallery]);
    const oldFiles = [before.cover_image, ...((before.gallery as string[]) ?? [])];
    await Promise.all(
      oldFiles.filter((url) => url && !stillUsed.has(url)).map((url) => removeFile(supabase, url, "images")),
    );
  }

  contentChanged();
  return ok(input.id ? "Project saved." : "Project added.");
}

// ---- Experience ----

export type ExperienceInput = {
  id?: string;
  role: string;
  organization: string;
  start_date: string; // "2025-06-01"
  end_date: string | null; // null = present
  description: string;
  category: ExperienceCategory;
  status: Status;
  show_for: string[];
  proof?: ProofItem[]; // watermarked proof images with optional captions, in display order
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function saveExperience(input: ExperienceInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const problem = checkCommon(input);
  if (problem) return fail(problem);

  const role = input.role.trim();
  const organization = input.organization.trim();
  if (!role || role.length > 120) return fail("Role is required (120 characters max).");
  if (!organization || organization.length > 120)
    return fail("Organization is required (120 characters max).");
  if (!DATE_PATTERN.test(input.start_date)) return fail("Please enter a start date.");
  if (input.end_date && !DATE_PATTERN.test(input.end_date)) return fail("End date is invalid.");
  if (input.end_date && input.end_date < input.start_date)
    return fail("End date can't be before the start date.");
  if (input.description.length > 2000) return fail("Description is too long (2000 max).");
  if (!["va", "teaching", "business"].includes(input.category)) return fail("Invalid category.");
  const proof = (input.proof ?? []).map((p) => ({ url: p.url, caption: (p.caption ?? "").trim() }));
  if (proof.length > 6 || !proof.every((p) => isOwnFileUrl(p.url, "images"))) {
    return fail("Proof images must be uploaded here (6 max).");
  }
  if (proof.some((p) => p.caption.length > 500)) return fail("Keep each proof caption under 500 characters.");

  const { data: before } = input.id
    ? await supabase.from("experience").select("*").eq("id", input.id).single()
    : { data: null };

  const { error } = await upsert(supabase, "experience", input.id, {
    role,
    organization,
    start_date: input.start_date,
    end_date: input.end_date || null,
    description: input.description.trim(),
    category: input.category,
    status: input.status,
    show_for: input.show_for,
    proof,
  });
  if (error?.code === "PGRST204") {
    return fail("The proof captions field doesn't exist yet. Run supabase/setup.sql in Supabase first.");
  }
  if (error) return dbError("save the experience", error);

  // Delete proof images that were removed
  const keep = new Set(proof.map((p) => p.url));
  const removed = before ? experienceProof(before as Experience).filter((p) => !keep.has(p.url)) : [];
  await Promise.all(removed.map((p) => removeFile(supabase, p.url, "images")));

  contentChanged();
  return ok(input.id ? "Experience saved." : "Experience added.");
}

// ---- Skills ----

export type SkillInput = {
  id?: string;
  name: string;
  skill_group: SkillGroup;
  status: Status;
  show_for: string[];
  icon?: string | null; // library logo slug, "none", or null = match by name
  logo_url?: string | null; // uploaded logo image
};

export async function saveSkill(input: SkillInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const problem = checkCommon(input);
  if (problem) return fail(problem);

  const name = input.name.trim();
  if (!name || name.length > 60) return fail("Name is required (60 characters max).");
  if (!["admin", "technical"].includes(input.skill_group)) return fail("Invalid group.");
  const icon = input.icon || null;
  if (icon && icon !== "none" && !isBrandIcon(icon))
    return fail("Please pick a logo from the search results.");
  const logoUrl = input.logo_url || null;
  if (logoUrl && !isOwnFileUrl(logoUrl, "images")) return fail("Logo must be uploaded here.");

  const { data: before } = input.id
    ? await supabase.from("skills").select("logo_url").eq("id", input.id).single()
    : { data: null };

  const { error } = await upsert(
    supabase,
    "skills",
    input.id,
    {
      name,
      skill_group: input.skill_group,
      status: input.status,
      show_for: input.show_for,
      icon,
      logo_url: logoUrl,
    },
    { column: "skill_group", value: input.skill_group },
  );
  if (error?.code === "PGRST204") {
    return fail("The logo fields don't exist yet. Run supabase/setup.sql in Supabase first.");
  }
  if (error) return dbError("save the skill", error);

  // Replaced or removed an uploaded logo? Delete the old file.
  if (before?.logo_url && before.logo_url !== logoUrl) await removeFile(supabase, before.logo_url, "images");

  contentChanged();
  return ok(input.id ? "Skill saved." : "Skill added.");
}

// ---- Certificates ----

export type CertificateInput = {
  id?: string;
  title: string;
  issuer: string;
  credential_id: string;
  issue_date: string; // "" = not set
  expiry_date: string; // "" = no expiration
  credential_url: string;
  image_url: string | null;
  status: Status;
  show_for: string[];
};

export async function saveCertificate(input: CertificateInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const problem = checkCommon(input);
  if (problem) return fail(problem);

  const title = input.title.trim();
  const credentialUrl = withHttps(input.credential_url);
  if (!title || title.length > 160) return fail("Certificate name is required (160 characters max).");
  if (input.issuer.length > 120) return fail("Issuer is too long (120 max).");
  if (input.credential_id.length > 120) return fail("Credential ID is too long (120 max).");
  if (input.issue_date && !DATE_PATTERN.test(input.issue_date)) return fail("Issue date is invalid.");
  if (input.expiry_date && !DATE_PATTERN.test(input.expiry_date)) return fail("Expiry date is invalid.");
  if (input.issue_date && input.expiry_date && input.expiry_date < input.issue_date) {
    return fail("Expiry date can't be before the issue date.");
  }
  if (credentialUrl && !isHttpUrl(credentialUrl)) return fail("Verification link doesn't look valid.");
  if (input.image_url && !isOwnFileUrl(input.image_url, "images"))
    return fail("Image must be uploaded here.");

  const { data: before } = input.id
    ? await supabase.from("certificates").select("image_url").eq("id", input.id).single()
    : { data: null };

  const { error } = await upsert(supabase, "certificates", input.id, {
    title,
    issuer: input.issuer.trim(),
    credential_id: input.credential_id.trim() || null,
    issue_date: input.issue_date || null,
    expiry_date: input.expiry_date || null,
    credential_url: credentialUrl || null,
    image_url: input.image_url,
    status: input.status,
    show_for: input.show_for,
  });
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return fail("The certificates table doesn't exist yet. Run supabase/setup.sql first.");
    }
    return dbError("save the certificate", error);
  }

  // Replaced or removed the picture? Delete the old preview file.
  if (before?.image_url && before.image_url !== input.image_url) {
    await removeFile(supabase, before.image_url, "images");
  }

  contentChanged();
  return ok(input.id ? "Certificate saved." : "Certificate added.");
}

// ---- FAQ ----

export type FaqInput = {
  id?: string;
  question: string;
  answer: string;
  status: Status;
  show_for: string[];
};

export async function saveFaq(input: FaqInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const problem = checkCommon(input);
  if (problem) return fail(problem);

  const question = input.question.trim();
  const answer = input.answer.trim();
  if (!question || question.length > 200) return fail("Question is required (200 characters max).");
  if (!answer || answer.length > 2000) return fail("Answer is required (2000 characters max).");

  const { error } = await upsert(supabase, "faqs", input.id, {
    question,
    answer,
    status: input.status,
    show_for: input.show_for,
  });
  if (error?.code === "42P01" || error?.code === "PGRST205") {
    return fail("The FAQ table doesn't exist yet. Run supabase/setup.sql first.");
  }
  if (error) return dbError("save the question", error);

  contentChanged();
  return ok(input.id ? "Question saved." : "Question added.");
}

// ---- Sample Work ----

export type SampleInput = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  result: string;
  description: string;
  tools: string[];
  items: SampleItem[]; // photos and PDFs, in display order
  status: Status;
  show_for: string[];
};

const MAX_SAMPLE_ITEMS = 30;
// Photos are stored in the "images" bucket, PDFs in "resumes"
const bucketFor = (kind: SampleItem["kind"]) => (kind === "pdf" ? "resumes" : "images");

export async function saveSample(input: SampleInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const problem = checkCommon(input);
  if (problem) return fail(problem);

  const title = input.title.trim();
  const slug = input.slug.trim() || slugify(title);
  const tools = [...new Set(input.tools.map((t) => t.trim()).filter(Boolean))];
  const items: SampleItem[] = input.items.map((item) => ({
    url: item.url,
    kind: item.kind === "pdf" ? "pdf" : "image",
    name: (item.name ?? "").trim().slice(0, 200),
    caption: (item.caption ?? "").trim(),
  }));

  if (!title || title.length > 120) return fail("Title is required (120 characters max).");
  if (!SLUG_PATTERN.test(slug)) return fail("URL name can only use lowercase letters, numbers, and dashes.");
  if (input.summary.length > 300) return fail("Summary is too long (300 max).");
  if (input.result.trim().length > 160) return fail("Result is too long (160 max).");
  if (input.description.length > 20000) return fail("Description is too long (20,000 max).");
  if (tools.length > 20 || tools.some((t) => t.length > 40))
    return fail("Up to 20 tools, 40 characters each.");
  if (items.length > MAX_SAMPLE_ITEMS) return fail(`Up to ${MAX_SAMPLE_ITEMS} photos and PDFs per sample.`);
  if (!items.every((item) => isOwnFileUrl(item.url, bucketFor(item.kind)))) {
    return fail("Photos and PDFs must be uploaded here.");
  }
  if (items.some((item) => item.caption.length > 1000))
    return fail("Keep each description under 1000 characters.");

  // Remember the old files so we can delete ones that were removed
  const { data: before } = input.id
    ? await supabase.from("work_samples").select("items").eq("id", input.id).single()
    : { data: null };

  const { error } = await upsert(supabase, "work_samples", input.id, {
    title,
    slug,
    summary: input.summary.trim(),
    result: input.result.trim(),
    description: input.description.trim(),
    tools,
    items,
    status: input.status,
    show_for: input.show_for,
  });
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return fail(
        "The Sample Work table doesn't exist yet. Run supabase/updates/0010_work_samples.sql first.",
      );
    }
    if (error.code === "PGRST204" && error.message.includes("result")) {
      return fail(
        "The Result field needs a one-time setup. Run supabase/updates/0011_sample_results.sql first.",
      );
    }
    if (error.code === "23505") return fail(`Another sample already uses the URL /samples/${slug}.`);
    return dbError("save the sample", error);
  }

  if (before) {
    const keep = new Set(items.map((item) => item.url));
    const removed = ((before.items as SampleItem[]) ?? []).filter((item) => !keep.has(item.url));
    await Promise.all(removed.map((item) => removeFile(supabase, item.url, bucketFor(item.kind))));
  }

  contentChanged();
  return ok(input.id ? "Sample saved." : "Sample added.");
}

// ---- Testimonials ----

export type TestimonialInput = {
  id?: string;
  name: string;
  role: string;
  quote: string;
  status: Status;
};

export async function saveTestimonial(input: TestimonialInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const problem = checkCommon(input);
  if (problem) return fail(problem);

  const name = input.name.trim();
  const quote = input.quote.trim();
  if (!name || name.length > 100) return fail("Name is required (100 characters max).");
  if (input.role.length > 120) return fail("Role is too long (120 max).");
  if (!quote || quote.length > 1500) return fail("Quote is required (1500 characters max).");

  const { error } = await upsert(supabase, "testimonials", input.id, {
    name,
    role: input.role.trim(),
    quote,
    status: input.status,
  });
  if (error) return dbError("save the testimonial", error);

  contentChanged();
  return ok(input.id ? "Testimonial saved." : "Testimonial added.");
}
