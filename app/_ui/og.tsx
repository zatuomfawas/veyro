import { ImageResponse } from "next/og";

// The shared social card.
//
// Generated at build time by next/og rather than served as a static asset: the
// prototype pointed og:image at "/og.svg", a file that does not exist in this
// repo, and SVG is not reliably supported as a social-card image by Twitter/X
// or Facebook's crawlers anyway. This produces a real PNG.
//
// Written once. Six pages need a card, and six copy-pasted files would drift
// within a month: one would keep an old brand colour, another would lose the
// mark. Each page supplies only its eyebrow and headline.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Brand tokens and the accent-mark clip-path, both taken from app/_ui/css.ts
// (--brand, --reverse, and the polygon used by .dmark) so the card matches the
// design system rather than approximating it.
const BRAND = "#1e4636";
const REVERSE = "#f4f2ec";
const MUTED = "#c9c4b6";
const MARK_CLIP = "polygon(0 0, 26% 0, 45% 62%, 64% 0, 100% 0, 58% 100%, 43% 100%)";

export function ogImage({
  eyebrow, title, footnote,
}: { eyebrow: string; title: string; footnote?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: BRAND,
          color: REVERSE,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 44, height: 44, background: REVERSE, clipPath: MARK_CLIP }} />
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>Veyro</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 24, color: MUTED, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {eyebrow}
          </div>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", maxWidth: 940 }}>
            {title}
          </div>
        </div>

        <div style={{ fontSize: 24, color: MUTED }}>
          {footnote ?? "withveyro.com"}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
