import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/app/_ui/og";

export const alt = "Veyro: how we built real payments for under-18s.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "Research",
    title: "How we built real payments for under-18s.",
    footnote: "Their exact reply, 8 September 2026",
  });
}
