import type { MetadataRoute } from "next";
import { SITE, SEO_ROUTES, type SeoRouteKey } from "@/lib/seo";

// Public pages that have their own metadata rather than a SEO_ROUTES entry.
// Listed explicitly so the sitemap cannot claim a route that was never built.
const EXTRA: { path: string; priority: number }[] = [
  // High: it is the page that answers "how do I actually use this", which is
  // the question most people arrive with.
  { path: "/get-started", priority: 0.9 },
  { path: "/wallet", priority: 0.8 },
  { path: "/for-founders", priority: 0.7 },
  { path: "/faq", priority: 0.7 },
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.4 },
  { path: "/status", priority: 0.2 },
];

// Only routes that (a) exist as real pages and (b) are indexable. Listing a
// page that 404s, or one marked noindex, is how you teach a crawler to
// distrust the sitemap. Add a key here when its page is actually built.
const BUILT: SeoRouteKey[] = [
  "landing", "check", "how", "guardians", "terms", "privacy", "accessibility",
];

const PRIORITY: Partial<Record<SeoRouteKey, number>> = {
  landing: 1,
  check: 0.9,
  how: 0.8,
  guardians: 0.7,
  terms: 0.3,
  privacy: 0.3,
  accessibility: 0.3,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...BUILT.filter((key) => !SEO_ROUTES[key].noindex).map((key) => ({
      url: SITE + SEO_ROUTES[key].path,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: PRIORITY[key] ?? 0.5,
    })),
    ...EXTRA.map((e) => ({
      url: SITE + e.path,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: e.priority,
    })),
  ];
}
