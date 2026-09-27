import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The form endpoint has nothing to index and shouldn't be crawled.
      disallow: "/api/",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
