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
  | "education"
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
  "education",
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

// A school, strand, or degree (migration 0012)
export type Education = {
  id: string;
  school: string;
  program: string; // e.g. "Senior High School · ABM Strand"
  location: string;
  start_year: number | null;
  end_year: number | null; // graduation year, or the expected one
  in_progress: boolean;
  details: string; // honors, focus, thesis
  files?: SampleItem[]; // diploma, transcript (migration 0013; missing until it's run)
  status: Status;
  show_for: string[];
  sort_order: number;
};

/** "2016 – 2018", "2023 – Expected 2027", "2023 – Present", or "" with no years. */
export function educationYears(e: Pick<Education, "start_year" | "end_year" | "in_progress">) {
  const end = e.end_year
    ? `${e.in_progress ? "Expected " : ""}${e.end_year}`
    : e.in_progress
      ? "Present"
      : "";
  if (e.start_year && end) return `${e.start_year} – ${end}`;
  return e.start_year ? String(e.start_year) : end;
}

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

// One photo, PDF, or video in a work sample, with its own description (migration 0010).
// "video" is an uploaded file (migration 0014); "link" is a YouTube, Loom,
// Vimeo, or Google Drive video played on the page (url = its embed address).
export type SampleItem = {
  url: string;
  kind: "image" | "pdf" | "video" | "link";
  name: string; // original file name (PDFs, videos), or the site name for links
  caption: string;
};

/**
 * Turns a YouTube, Loom, Vimeo, or Google Drive link into the address that
 * plays it inside a page, or null if it isn't one of those. Passing an embed
 * address back in gives the same address, which is how saving checks it.
 */
export function videoEmbed(link: string): { url: string; name: string } | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^(www|m)\./, "");
  const path = url.pathname;
  let match: RegExpMatchArray | null;

  // youtube.com/watch?v=ID, youtu.be/ID, /shorts/ID, /live/ID, /embed/ID
  const youtubeId =
    host === "youtu.be"
      ? path.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? (url.searchParams.get("v") ?? path.match(/^\/(?:shorts|live|embed)\/([^/]+)/)?.[1])
        : null;
  if (youtubeId && /^[\w-]{11}$/.test(youtubeId)) {
    // The no-cookie player doesn't track visitors until they press play
    return { url: `https://www.youtube-nocookie.com/embed/${youtubeId}`, name: "YouTube" };
  }
  if (host === "loom.com" && (match = path.match(/^\/(?:share|embed)\/([0-9a-f]{32})/))) {
    return { url: `https://www.loom.com/embed/${match[1]}`, name: "Loom" };
  }
  // vimeo.com/ID, vimeo.com/ID/HASH (unlisted), player.vimeo.com/video/ID?h=HASH
  if (
    (host === "vimeo.com" && (match = path.match(/^\/(\d+)(?:\/([0-9a-f]+))?\/?$/))) ||
    (host === "player.vimeo.com" && (match = path.match(/^\/video\/(\d+)\/?$/)))
  ) {
    const hash = match[2] ?? url.searchParams.get("h");
    const query = hash && /^[0-9a-f]+$/.test(hash) ? `?h=${hash}` : "";
    return { url: `https://player.vimeo.com/video/${match[1]}${query}`, name: "Vimeo" };
  }
  if (host === "drive.google.com" && (match = path.match(/^\/file\/d\/([\w-]+)/))) {
    return { url: `https://drive.google.com/file/d/${match[1]}/preview`, name: "Google Drive" };
  }
  return null;
}

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

/** "3 photos · 1 PDF · 2 videos", or "" when there are none. */
export function sampleItemCount(items: SampleItem[]) {
  const photos = items.filter((i) => i.kind === "image").length;
  const pdfs = items.filter((i) => i.kind === "pdf").length;
  const videos = items.length - photos - pdfs;
  return [
    photos && `${photos} photo${photos === 1 ? "" : "s"}`,
    pdfs && `${pdfs} PDF${pdfs === 1 ? "" : "s"}`,
    videos && `${videos} video${videos === 1 ? "" : "s"}`,
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
