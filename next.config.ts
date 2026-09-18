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
// 'unsafe-inline' for scripts is NOT granted. Next's inline bootstrap is
// covered by the strict-dynamic-free allowlist below via 'self'.
const CSP_PRODUCTION = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://js.stripe.com",
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
