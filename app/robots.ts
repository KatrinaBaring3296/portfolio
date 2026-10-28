import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// /robots.txt: lets search engines in, keeps them out of the admin panel
// and the private testimonial links.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/review"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
