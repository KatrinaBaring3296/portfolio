import type { MetadataRoute } from "next";
import { getProfile, getProjectSlugs, getPublicProfiles } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

// /sitemap.xml: the list of public pages, so search engines find them all.
// Hidden profiles and projects are left out automatically.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profiles, defaultProfile, projectSlugs] = await Promise.all([
    getPublicProfiles(),
    getProfile(),
    getProjectSlugs(),
  ]);

  return [
    { url: `${SITE_URL}/`, priority: 1 },
    // The default profile is already "/", so it isn't listed twice
    ...profiles
      .filter((p) => p.id !== defaultProfile?.id)
      .map((p) => ({ url: `${SITE_URL}/for/${p.slug}`, priority: 0.8 })),
    ...projectSlugs.map((slug) => ({ url: `${SITE_URL}/projects/${slug}`, priority: 0.6 })),
  ];
}
