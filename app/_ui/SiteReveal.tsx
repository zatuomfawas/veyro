import { Reveal, type RevealGroup } from "@/app/_ui/Reveal";

// The site's scroll entrances, in one place.
//
// WHY THIS EXISTS RATHER THAN A CONFIG PER PAGE. Eight public pages share four
// structural patterns: a chapter, a section with a wrapper, a feature grid and
// a closing band. Written out per page, those four would be copied eight times
// and the ninth page would get a fifth variant nobody noticed was different.
// One vocabulary, imported, means the whole site moves the same way, which is
// most of what separates motion that reads as considered from motion that
// reads as decoration.
//
// WHAT DOES NOT GET AN ENTRANCE, and the omissions are deliberate.
//
// The legal pages. /terms, /privacy and the archived set are a contract
// somebody may be reading because they are worried, and a clause that fades in
// as it is scrolled to is a document arguing with its reader. They render
// instantly and completely.
//
// Forms. /check and the auth pages put a control under the cursor; animating
// the thing somebody is about to type into is the one place motion costs
// something real.
//
// Paragraph-level anything. These groups target section-level children -- a
// heading, a grid, a list as a block -- never the sentences inside them. Forty
// paragraphs fading one at a time is the pattern that gives scroll animation
// its bad name, and on a long page it makes reading feel like waiting.

const SHARED: RevealGroup[] = [
  // A chapter heading and its body, in reading order.
  { select: ".how-chapter > *", stagger: 60 },
  // Generic public sections: whatever the section puts directly in its wrapper.
  { select: "section.lp > .wrap-lp > *", stagger: 60 },
  // Pricing's two-up feature blocks.
  { select: ".public-feature-grid > *", stagger: 80 },
  // Question lists, which are already one row per answer.
  { select: ".public-faq > *", stagger: 55, maxStagger: 6 },
  // The closing band, last thing on most pages.
  { select: ".public-close .wrap-lp > *", stagger: 80 },
];

/**
 * Mounts the shared entrances, plus anything a page needs on top.
 *
 * `extra` goes first, because Reveal gives an element to the first group that
 * claims it: a page that wants a specific element to move a specific way has
 * to be able to say so before the generic rule picks it up.
 */
export function SiteReveal({ extra }: { extra?: RevealGroup[] }) {
  // SHARED by identity when there is nothing to merge, so the array Reveal
  // depends on does not change between renders.
  const groups = extra && extra.length ? [...extra, ...SHARED] : SHARED;
  return <Reveal scope=".fw" groups={groups} />;
}
