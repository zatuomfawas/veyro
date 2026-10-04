import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from "@/app/_ui/og";

// This card is how the page reaches the person it is for: a teenager sends the
// link, and the parent sees this before they see anything else.
//
// The footnote is not "the veto you do not get", which is what the old card
// said. That overstates the position and alarms the reader in the same breath.
export const alt = "Veyro: what you are actually being asked to agree to.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImage({
    eyebrow: "For parents",
    title: "What you are actually being asked to agree to.",
    footnote: "Including what is not settled",
  });
}
