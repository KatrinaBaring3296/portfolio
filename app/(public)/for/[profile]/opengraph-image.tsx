import { getProfile, getPublicProfiles, getSettings } from "@/lib/content";
import { OG_SIZE, profileOgImage } from "@/lib/og-image";

// Link-preview image for /for/[profile], e.g. /for/online-tutor
export const alt = "Portfolio preview";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const profiles = await getPublicProfiles();
  return profiles.length > 0 ? profiles.map((p) => ({ profile: p.slug })) : [{ profile: "__none__" }];
}

export default async function Image({ params }: { params: Promise<{ profile: string }> }) {
  const { profile: slug } = await params;
  const [settings, profile] = await Promise.all([getSettings(), getProfile(slug)]);
  return profileOgImage(settings, profile);
}
