import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/app/_ui/og";

export const alt = "Veyro: What you are being asked to agree to.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "For parents and guardians",
    title: "What you are being asked to agree to.",
    footnote: "Including the veto you do not get",
  });
}
