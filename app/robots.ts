import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Real /robots.txt via Next's file convention. The API surface and the signed-in
// app are not content; only the public marketing pages should be crawled.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
