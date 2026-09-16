import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/app/_ui/og";

export const alt = "Veyro: We asked Stripe whether under-18s can take payments.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "Research",
    title: "We asked Stripe whether under-18s can take payments.",
    footnote: "Their exact reply, 8 September 2026",
  });
}
