// Shapes of the content shown on the site.
// These mirror the Supabase tables we'll create in Phase 3, so swapping
// the sample data for real data won't change any component.

export type Status = "active" | "coming_soon" | "hidden";

// Homepage sections a profile can reorder. The hero always comes first.
export type SectionKey =
  | "about"
  | "services"
  | "experience"
  | "samples"
  | "projects"
  | "skills"
  | "certifications"
  | "testimonials"
  | "faq"
  | "contact";

/** Every section, in the default order. */
export const ALL_SECTIONS: SectionKey[] = [
  "about",
  "services",
  "experience",
  "samples",
  "projects",
  "skills",
  "certifications",
  "testimonials",
  "faq",
  "contact",
];

/**
 * A profile's section order with any missing sections added (just before
 * Contact) and unknown ones dropped. Keeps older profiles working when a
 * new section type is added.
 */
export function completeSectionOrder(order: SectionKey[]): SectionKey[] {
  const known = order.filter((key) => ALL_SECTIONS.includes(key));
  const missing = ALL_SECTIONS.filter((key) => !known.includes(key));
  const contactAt = known.indexOf("contact");
  if (contactAt === -1) return [...known, ...missing];
  return [...known.slice(0, contactAt), ...missing, ...known.slice(contactAt)];
}

export type AvailabilityStatus = "available" | "limited" | "booked";

export type Faq = {
  id: string;
  question: string;
  answer: string;
  status: Status;
  show_for: string[];
  sort_order: number;
};

export type SocialLink = {
  label: string; // e.g. "LinkedIn"
  url: string;
};

export type SiteSettings = {
  name: string;
  photo_url: string | null;
  email: string;
  about: string;
  social_links: SocialLink[];
  availability_text: string;
  reply_time_text: string;
  default_profile_id: string | null;
  // Colors the availability badge (migration 0009)
  availability_status?: AvailabilityStatus;
  // "Book a call" link (migration 0003)
  booking_url?: string | null;
  // Hiring platforms, e.g. [{ label: "Upwork", url: "https://..." }] (migration 0004).
  // Each becomes a "Hire me on <label>" button.
  hiring_platforms?: SocialLink[];
  // Old single-platform fields from 0003, replaced by hiring_platforms in 0004
  upwork_url?: string | null;
  onlinejobs_url?: string | null;
};

/** The hiring platforms list, falling back to the old Upwork/OnlineJobs fields before migration 0004. */
export function hiringPlatforms(settings: SiteSettings): SocialLink[] {
  if (Array.isArray(settings.hiring_platforms)) return settings.hiring_platforms;
  return [
    { label: "Upwork", url: settings.upwork_url ?? "" },
    { label: "OnlineJobs.ph", url: settings.onlinejobs_url ?? "" },
  ].filter((p) => p.url);
}

export type FocusProfile = {
  id: string;
  slug: string;
  label: string;
  headline: string;
  pitch: string;
  resume_url: string | null;
  highlighted_category_ids: string[];
  section_order: SectionKey[];
  status: Status;
  sort_order: number;
};

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // a name from components/public/icon.tsx
  status: Status;
  sort_order: number;
};

export type Service = {
  id: string;
  category_id: string;
  title: string;
  description: string;
  icon: string;
  status: Status;
  sort_order: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string; // markdown
  tech_stack: string[];
  cover_image: string | null;
  gallery: string[];
  github_url: string | null;
  demo_url: string | null;
  featured: boolean;
  status: Status;
  show_for: string[]; // profile IDs; empty = every profile
  sort_order: number;
};

// One photo or PDF in a work sample, with its own description (migration 0010)
export type SampleItem = {
  url: string;
  kind: "image" | "pdf";
  name: string; // original file name, shown for PDFs
  caption: string;
};

export type WorkSample = {
  id: string;
  slug: string;
  title: string;
  summary: string; // one sentence for the card
  result?: string; // one-line outcome shown first (migration 0011; missing until it's run)
  description: string; // main description, markdown
  tools: string[];
  items: SampleItem[];
  status: Status;
  show_for: string[]; // profile IDs; empty = every profile
  sort_order: number;
};

/** "3 photos · 1 PDF", or "" when there are none. */
export function sampleItemCount(items: SampleItem[]) {
  const photos = items.filter((i) => i.kind === "image").length;
  const pdfs = items.length - photos;
  return [
    photos && `${photos} photo${photos === 1 ? "" : "s"}`,
    pdfs && `${pdfs} PDF${pdfs === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export type ExperienceCategory = "va" | "teaching" | "business";

export type Experience = {
  id: string;
  role: string;
  organization: string;
  start_date: string; // "2024-06-01"
  end_date: string | null; // null = present
  description: string;
  category: ExperienceCategory;
  status: Status;
  show_for: string[];
  sort_order: number;
  // Watermarked proof images with optional captions (migration 0007)
  proof?: ProofItem[];
  // Older proof list without captions (migration 0006), replaced by `proof`
  proof_images?: string[];
};

export type ProofItem = { url: string; caption: string };

/** An experience entry's proof, falling back to the caption-less list before migration 0007. */
export function experienceProof(item: Pick<Experience, "proof" | "proof_images">): ProofItem[] {
  if (Array.isArray(item.proof)) return item.proof;
  return (item.proof_images ?? []).map((url) => ({ url, caption: "" }));
}

export type SkillGroup = "admin" | "technical";

export type Skill = {
  id: string;
  name: string;
  skill_group: SkillGroup;
  status: Status;
  show_for: string[];
  sort_order: number;
  // Logo (migration 0005): a library logo slug like "gmail", "none" for no
  // logo, or empty to match by name. An uploaded logo_url wins over icon.
  icon?: string | null;
  logo_url?: string | null;
};

/** A skill's logo, ready to draw: from the logo library or an uploaded image. */
export type SkillLogo =
  | { kind: "brand"; title: string; path: string; color: string; lightFill: string; darkFill: string }
  | { kind: "image"; url: string };

export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  credential_id: string | null;
  issue_date: string | null; // "2025-06-01"
  expiry_date: string | null; // null = no expiration
  credential_url: string | null; // the issuer's "verify" page
  image_url: string | null; // watermarked preview, never the original
  status: Status;
  show_for: string[];
  sort_order: number;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  status: Status;
  sort_order: number;
};
