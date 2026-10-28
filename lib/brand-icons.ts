import * as simpleIcons from "simple-icons";
import type { SimpleIcon } from "simple-icons";
import type { Skill, SkillLogo } from "./types";

// Brand logos from Simple Icons (simpleicons.org, ~3,400 logos, free to use).
// Import this only from server code (Server Components, server actions): the
// whole library then stays on the server, and visitors only receive the few
// logos actually shown on the page.
//
// Some brands (e.g. Canva, Slack, OpenAI, Microsoft) asked to be removed from
// the library; for those, upload a logo image in Admin > Skills instead.

const ALL: SimpleIcon[] = Object.values(simpleIcons).filter(
  (icon): icon is SimpleIcon => typeof icon === "object" && icon !== null && "slug" in icon && "path" in icon,
);
const BY_SLUG = new Map(ALL.map((icon) => [icon.slug, icon]));
const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
const BY_TITLE = new Map(ALL.map((icon) => [normalize(icon.title), icon]));

// Relative brightness of a hex color (0 = black, 1 = white)
function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ready-to-draw logo data, with fills adjusted so it stays visible in both themes. */
function toLogo(icon: SimpleIcon): SkillLogo {
  const color = `#${icon.hex}`;
  const lum = luminance(icon.hex);
  return {
    kind: "brand",
    title: icon.title,
    path: icon.path,
    color,
    // Near-white logos would vanish on a white tile; near-black ones on navy
    lightFill: lum > 0.8 ? "#0f172a" : color,
    darkFill: lum < 0.06 ? "#ffffff" : color,
  };
}

/** The logo to show for a skill, or null for none. */
export function skillLogo(skill: Pick<Skill, "name" | "icon" | "logo_url">): SkillLogo | null {
  if (skill.logo_url) return { kind: "image", url: skill.logo_url };
  if (skill.icon === "none") return null;
  const icon = skill.icon ? BY_SLUG.get(skill.icon) : BY_TITLE.get(normalize(skill.name));
  return icon ? toLogo(icon) : null;
}

/** Just the SVG path of a library logo, e.g. "whatsapp" for the chat button. */
export function brandLogoPath(slug: string) {
  return BY_SLUG.get(slug)?.path ?? null;
}

export function isBrandIcon(slug: string) {
  return BY_SLUG.has(slug);
}

/** Logos whose name matches the search, best matches first. */
export function searchBrandIcons(query: string, limit = 12) {
  const q = normalize(query);
  if (!q) return [];
  const scored = ALL.map((icon) => {
    const title = normalize(icon.title);
    const score =
      title === q ? 0 : title.startsWith(q) ? 1 : title.includes(q) ? 2 : icon.slug.includes(q) ? 3 : -1;
    return { icon, score };
  })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || a.icon.title.length - b.icon.title.length)
    .slice(0, limit);
  return scored.map(({ icon }) => ({ slug: icon.slug, logo: toLogo(icon) }));
}
