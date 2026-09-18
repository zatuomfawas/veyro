import type { Metadata } from "next";
import { Archivo, Onest } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE, SEO_ROUTES } from "@/lib/seo";
import "./globals.css";

// Fonts are self-hosted, not fetched from Google at runtime.
//
// This used to be an @import of fonts.googleapis.com inside the injected
// <style> block in app/_ui/css.ts. Two things were wrong with that. An @import
// is only honoured at the top of a stylesheet, and that block is injected
// mid-document, so browsers were entitled to ignore it outright. And when it did
// work it made every first paint wait on a third-party request that can be slow,
// blocked, or unreachable, with no fallback signal: the page would silently
// render in Arial and nobody would know.
//
// next/font downloads both faces at build time and serves them from our own
// origin, so there is no runtime dependency on Google, no extra DNS or TLS
// handshake, and no layout shift. `display: "swap"` means text is readable
// immediately in the fallback and reflows once when the real face arrives.
//
// The faces themselves are unchanged:
//
//   Archivo — display only, for the wordmark. A grotesk with a real variable
//   width axis, which is what makes the 118% stretch in --display-wdth possible
//   without faking it by scaling glyphs.
//
//   Onest — interface text. A plain, high-x-height workhorse that stays legible
//   at 11.5px, the smallest step in the type scale.
//
// See DESIGN.md for why these two rather than the usual defaults.

// No `weight` here on purpose: naming fixed weights opts out of the variable
// font, and `axes` is only allowed on a variable one. The wordmark needs the
// wdth axis (--display-wdth: 118%), so the variable build is the requirement,
// not a preference. Leaving weight unset gives the full wght range too.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

const onest = Onest({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-onest",
});

export const metadata: Metadata = {
  // Lets URL-based metadata fields (canonical, og:url, og:image) on any route
  // resolve against the real site. Pages override title/description via
  // buildMetadata(); this is the fallback for anything that doesn't.
  metadataBase: new URL(SITE),
  title: {
    default: SEO_ROUTES.landing.title,
    template: "%s",
  },
  description: SEO_ROUTES.landing.desc,
  applicationName: "Veyro",
  authors: [{ name: "Veyro" }],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // The two variables land on <html>, where app/_ui/css.ts reads them for
  // --display and --ui.
  return (
    <html lang="en" className={`${archivo.variable} ${onest.variable}`}>
      <body>
        {children}
        {/* Vercel Analytics: aggregate page views, no cookie.
 
            Chosen over PostHog, Mixpanel and Google Analytics deliberately. The
            people using this product are 13 to 17, and under GDPR Article 8 the
            digital consent age is 13 to 16 depending on the member state, so a
            meaningful share of them cannot lawfully consent to behavioural
            tracking. Session recording on minors also sits badly beside a
            product whose pitch to their parents is that it never receives their
            documents and takes no percentage.

            It sets no cookie and uses no browser storage: verified against the
            package source, not its marketing. The script and its beacon are both
            served from /_vercel/insights on our own origin, so the production
            CSP needed no change at all. See /privacy, which names Vercel as the
            processor. */}
        <Analytics />
      </body>
    </html>
  );
}
