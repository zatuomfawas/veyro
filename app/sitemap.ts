import type { MetadataRoute } from "next";
import { SITE, SEO_ROUTES, type SeoRouteKey } from "@/lib/seo";

// Only routes that (a) exist as real pages and (b) are indexable. Listing a
// page that 404s, or one marked noindex, is how you teach a crawler to
// distrust the sitemap. Add a key here when its page is actually built.
const BUILT: SeoRouteKey[] = ["landing", "check", "how"];

const PRIORITY: Partial<Record<SeoRouteKey, number>> = {
  landing: 1,
  check: 0.9,
  how: 0.8,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return BUILT.filter((key) => !SEO_ROUTES[key].noindex).map((key) => ({
    url: SITE + SEO_ROUTES[key].path,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: PRIORITY[key] ?? 0.5,
  }));
}
