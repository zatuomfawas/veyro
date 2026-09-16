import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/app/_ui/og";

export const alt = "Veyro: What has been measured, and what has not been tested.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "Accessibility Statement",
    title: "What has been measured, and what has not been tested.",
    footnote: "Target: WCAG 2.1 AA",
  });
}
