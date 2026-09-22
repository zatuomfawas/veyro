import { ImageResponse } from "next/og";
import { V_PATH } from "@/app/_ui/marks";

// iOS ignores SVG for the home-screen icon, so app/icon.svg isn't enough on its
// own. Generated as a PNG at build time rather than checked in as a binary.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#111315" }}>
        <svg width="180" height="180" viewBox="0 0 100 100">
          <path d={V_PATH} fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
