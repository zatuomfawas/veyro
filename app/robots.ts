import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

// Real /robots.txt via Next's file convention. The API surface and the signed-in
// app are not content; only the public marketing pages should be crawled.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /founder/ and /pay/ carry single-use tokens and payment links in the
        // URL; neither should ever appear in an index. The pages also send
        // noindex themselves, so this is belt and braces.
        disallow: ["/api/", "/dashboard/", "/auth/", "/founder/", "/pay/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
