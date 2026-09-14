// Real Next.js metadata, replacing the prototype's client-side stand-in.
//
// prototype/veyro.jsx's useSEO() hook (SEO_ROUTES + upsertMeta) patches
// document.head from a useEffect, after the client bundle hydrates. A crawler
// that doesn't execute JavaScript — or executes it and moves on before the
// effect fires — sees the bare shell, not that title or those tags. Next's
// `metadata` export is resolved on the server and lands in the first byte of
// HTML, which is what actually makes a route findable.
//
// SEO_ROUTES itself (path, title, description, noindex) is ported from that
// same object. Two entries carry a correction: `how` and `guardians` still
// read "guardian approval" / "what you are approving" in prototype/veyro.jsx
// as of this writing — the same false-veto claim COPY-FIXES.md corrected
// elsewhere in that file (Stripe Standard accounts can't give a guardian a
// payout veto; see lib/stripe-account.ts). That file has since reverted to
// the uncorrected wording, so the fix is re-applied here rather than shipped
// into real, indexable <meta> tags. Everything else is verbatim.

import type { Metadata, Viewport } from "next";

// The live domain. This is what every canonical, og:url, sitemap entry and the
// robots.txt Host line resolve against, so it has to be the domain people
// actually reach — a wrong value here tells search engines the real copy of
// every page lives somewhere else, which is worse than having no canonical at
// all. Overridable per environment, but it defaults to production on purpose:
// a preview deployment should still name production as canonical.
export const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://withveyro.com").replace(/\/$/, "");
export const BRAND_COLOR = "#1e4636";

// The mark, as a data URI — identical to prototype/veyro.jsx's FAVICON constant.
export const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<rect width="100" height="100" fill="#1e4636"/>' +
      '<path d="M18 26 L32 26 L48 60 L64 26 L86 26 L59 80 L46 80 Z" fill="#f4f2ec"/></svg>',
  );

export type SeoRouteKey =
  | "landing" | "how" | "guardians" | "checkout" | "check" | "notfound"
  | "thanks" | "accessibility" | "terms" | "privacy" | "pricing"
  | "signin" | "signup" | "invite";

export type SeoRoute = {
  path: string;
  title: string;
  desc: string;
  noindex?: boolean;
};

export const SEO_ROUTES: Record<SeoRouteKey, SeoRoute> = {
  landing: {
    path: "/",
    title: "Can you take payments under 18? Yes, from 13, with a guardian | Veyro",
    desc: "Most answers online say you must be 18. You can create a Stripe Standard account from 13 with a legal guardian as account owner. Veyro helps you get a parent to yes, then checks your checkout actually delivers.",
  },
  how: {
    path: "/how-it-works",
    // Corrected — see the file header.
    title: "How Veyro works, payments for young founders, with a guardian involved",
    desc: "Create your business, invite a guardian, connect a payment provider, and track pending, available and paid-out funds in one ledger.",
  },
  guardians: {
    path: "/for-guardians",
    // Corrected — see the file header.
    title: "For guardians, what you take on with Veyro",
    desc: "What a guardian is responsible for, what they can see, and how notifications and payouts work when supervising a young founder's business.",
  },
  checkout: {
    path: "/connect",
    title: "Connect payments to your app | Veyro",
    desc: "One supported way to add checkout to your project, and a six-point check that payment and delivery both work.",
    noindex: true,
  },
  check: {
    path: "/check",
    title: "Can you take payments under 18? Check in 20 seconds, Veyro",
    desc: "Answer two questions and find out which payment route applies to you, including when you don't need Veyro at all.",
  },
  notfound: { path: "/404", title: "Page not found | Veyro", desc: "That page does not exist.", noindex: true },
  thanks: { path: "/invitation-sent", title: "Invitation sent | Veyro", desc: "Your guardian invitation is on its way.", noindex: true },
  accessibility: {
    path: "/accessibility",
    title: "Accessibility Statement | Veyro",
    desc: "How Veyro is built for accessibility, what has been tested, and what has not.",
  },
  terms: {
    path: "/terms",
    title: "Terms of Service | Veyro",
    desc: "The terms covering the Veyro software, what the guardian agrees to, and what Veyro can and cannot enforce.",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy Policy | Veyro",
    desc: "What Veyro holds, what it is built never to receive, and how data about people under 18 is handled.",
  },
  pricing: {
    path: "/pricing",
    title: "Veyro pricing, free to start",
    desc: "Veyro is free for your first business. Pro adds multiple businesses, analytics and exportable financial records.",
  },
  signin: { path: "/auth/signin", title: "Sign in, Veyro", desc: "Sign in to your Veyro founder or guardian account.", noindex: true },
  signup: {
    path: "/auth/signup",
    title: "Start building, Veyro",
    desc: "Create your Veyro account and set up the financial side of your business in a few minutes.",
    noindex: true,
  },
  invite: { path: "/invitation", title: "Guardian invitation, Veyro", desc: "Review and respond to a guardian invitation.", noindex: true },
};

/**
 * Real Next.js Metadata for one SEO_ROUTES entry: title, description,
 * canonical, robots, Open Graph, and Twitter card — everything
 * prototype/veyro.jsx's useSEO() set by hand on document.head, produced here
 * as server-rendered <head> tags instead.
 */
export function buildMetadata(key: SeoRouteKey): Metadata {
  const r = SEO_ROUTES[key];
  const url = SITE + r.path;

  return {
    title: r.title,
    description: r.desc,
    alternates: { canonical: url },
    robots: r.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" as const } },
    // No `icons` here: app/icon.svg and app/apple-icon.tsx are Next file
    // conventions, picked up site-wide automatically. Setting them per page as
    // well produced two competing <link rel="icon"> tags.
    openGraph: {
      type: "website" as const,
      siteName: "Veyro",
      title: r.title,
      description: r.desc,
      url,
      // No `images` here: the prototype pointed this at "/og.svg", a file
      // that doesn't exist in this repo (and SVG isn't a reliable social-card
      // format anyway). A route with real artwork supplies its own via
      // Next's opengraph-image.tsx file convention (see app/check/) — Next
      // merges that in automatically. Routes without one get no image rather
      // than a broken link.
    },
    twitter: {
      card: "summary_large_image" as const,
      title: r.title,
      description: r.desc,
    },
  };
}

/** theme-color moved out of `metadata` and into `viewport` as of Next 14. */
export function buildViewport(): Viewport {
  return { themeColor: BRAND_COLOR };
}
