import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/app/_ui/og";

export const alt = "Veyro: What Veyro is, and what it is not.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "Terms of Service",
    title: "What Veyro is, and what it is not.",
    footnote: "Drafted, not lawyer-reviewed",
  });
}
