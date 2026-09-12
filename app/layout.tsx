import type { Metadata } from "next";
import { SITE, SEO_ROUTES } from "@/lib/seo";
import "./globals.css";

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
  // No font classes here: the Veyro design system loads Archivo and Onest
  // itself (see app/_ui/css.ts) and sets --ui / --display from them.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
