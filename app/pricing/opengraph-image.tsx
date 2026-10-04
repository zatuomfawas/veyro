import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/app/_ui/og";

export const alt = "Veyro pricing: free under $100 a month.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "Pricing",
    title: "Free under $100 a month.",
    footnote: "Then 3% on what is above it",
  });
}
