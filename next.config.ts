import type { NextConfig } from "next";

// Content-Security-Policy.
//
// Every host below is one this app actually talks to; nothing is listed
// speculatively, because a permissive CSP that nobody has reasoned about is
// worse than none: it looks like protection in an audit and stops nothing.
//
//   js.stripe.com       Stripe.js, loaded by @stripe/stripe-js on the pay page
//   api.stripe.com      the browser's calls to Stripe when confirming a payment
//   hooks.stripe.com    3D Secure and other redirect challenges, in an iframe
//   m.stripe.network    Stripe's fraud signals frame, loaded by Stripe.js
//
// Fonts are self-hosted by next/font, so font-src needs no third party and
// there is no fonts.gstatic.com entry. Images stay on 'self' plus data: URIs,
// which is what the icon and the OG cards use.
//
// 'unsafe-inline' for styles is unavoidable here: the design system ships as a
// string injected into a <style> tag on every page, and React sets inline style
// attributes throughout. Removing it means hashing or nonce-ing every one, which
// is a real change to how the system is delivered, not a config tweak.
//
// 'unsafe-inline' IS granted for scripts, and that is a reversal of what this
// file said before. The previous policy was wrong and it broke the site.
//
// Next ships two inline <script> tags on every page carrying the bootstrap and
// the flight payload. With script-src 'self' and no nonce, browsers blocked
// them, React never hydrated, and every client component silently stopped
// working in production: the eligibility checker, every form, the password
// toggles, the mobile menu. The pages still rendered, so it looked fine and was
// not. That is the worst kind of regression and it shipped because the CSP was
// verified by reading the header rather than by using the site.
//
// The correct fix is a per-request nonce set from proxy.ts, which Next then
// applies to its own scripts. It is not used here for one concrete reason: a
// nonce must be generated per request, so it forces dynamic rendering, and 24
// routes are currently static. Trading the entire marketing site's static
// rendering for one directive is not a trade worth making on a content site.
//
// Everything else stays strict: no 'unsafe-eval' in production, object-src
// none, base-uri and form-action self, frame-ancestors none, and connect-src
// and frame-src limited to the Stripe hosts actually used. The nonce remains
// the upgrade path if this ever becomes a mostly-dynamic application.
const CSP_PRODUCTION = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.stripe.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://m.stripe.network",
  "upgrade-insecure-requests",
].join("; ");

// Development needs 'unsafe-eval' and websocket connections for hot reloading.
// Shipping those to production would undo most of the point, so the two are
// kept apart rather than one loosened policy used everywhere.
const CSP_DEVELOPMENT = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // va.vercel-scripts.com is the @vercel/analytics DEBUG script, loaded only
  // when NODE_ENV is development. Production serves the real one from
  // /_vercel/insights on our own origin, so CSP_PRODUCTION needs no entry.
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.stripe.com",
  "font-src 'self' data:",
  "connect-src 'self' ws: wss: https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://m.stripe.network",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,

  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: isProd ? CSP_PRODUCTION : CSP_DEVELOPMENT,
          },
          // frame-ancestors 'none' above already covers this for modern
          // browsers. X-Frame-Options is kept for older ones, which ignore CSP
          // framing directives.
          { key: "X-Frame-Options", value: "DENY" },
          // Stops a browser second-guessing a Content-Type, which is how a
          // user-supplied file ends up executed as script.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send the full URL only to ourselves. Cross-origin gets the origin
          // alone, which matters because invite and payment links carry tokens
          // in the query string that must not leak in a Referer header.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing here needs a camera, a microphone or a location.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
