import { ImageResponse } from "next/og";

// Generated at build time (next/og's ImageResponse), not a static asset — the
// prototype pointed og:image/twitter:image at "/og.svg", a file that doesn't
// exist in this repo, and SVG isn't reliably supported as a social-card image
// by Twitter/X or Facebook's crawlers anyway. This produces a real PNG.
export const alt = "Veyro: can you take payments under 18? Check in 20 seconds.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens and the accent-mark clip-path, both taken from
// prototype/veyro.jsx's CSS/CSS2 (--brand, --reverse, and the polygon used by
// .dmark / .foldwhy li::before) so this card matches the design system.
const BRAND = "#1e4636";
const REVERSE = "#f4f2ec";
const MUTED = "#c9c4b6";
const MARK_CLIP = "polygon(0 0, 26% 0, 45% 62%, 64% 0, 100% 0, 58% 100%, 43% 100%)";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: BRAND,
          color: REVERSE,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 28, height: 28, background: REVERSE, clipPath: MARK_CLIP }} />
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>Veyro</span>
        </div>
        <div style={{ marginTop: 40, fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 920 }}>
          Can you take payments under 18?
        </div>
        <div style={{ marginTop: 20, fontSize: 30, color: MUTED, maxWidth: 860 }}>
          Check in 20 seconds: country, age, and whether you need a guardian at all.
        </div>
      </div>
    ),
    { ...size },
  );
}
