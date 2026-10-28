import { getProfile, getSettings } from "@/lib/content";
import { OG_SIZE, profileOgImage } from "@/lib/og-image";

// Link-preview image for "/" (the default profile)
export const alt = "Portfolio preview";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  return profileOgImage(settings, profile);
}
