import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/app/_ui/og";

export const alt = "Veyro: What Veyro holds, and what it is built never to receive.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "Privacy Policy",
    title: "What Veyro holds, and what it is built never to receive.",
    footnote: "No identity documents. No bank details.",
  });
}
