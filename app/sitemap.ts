import type { MetadataRoute } from "next";
import { getProfile, getProjectSlugs, getPublicProfiles, getSampleSlugs } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

// /sitemap.xml: the list of public pages, so search engines find them all.
// Hidden profiles, projects, and samples are left out automatically.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profiles, defaultProfile, projectSlugs, sampleSlugs] = await Promise.all([
    getPublicProfiles(),
    getProfile(),
    getProjectSlugs(),
    getSampleSlugs(),
  ]);

  return [
    { url: `${SITE_URL}/`, priority: 1 },
    // The default profile is already "/", so it isn't listed twice
    ...profiles
      .filter((p) => p.id !== defaultProfile?.id)
      .map((p) => ({ url: `${SITE_URL}/for/${p.slug}`, priority: 0.8 })),
    ...projectSlugs.map((slug) => ({ url: `${SITE_URL}/projects/${slug}`, priority: 0.6 })),
    ...sampleSlugs.map((slug) => ({ url: `${SITE_URL}/samples/${slug}`, priority: 0.6 })),
  ];
}
