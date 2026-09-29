// Founder stories shown on the homepage.
//
// This is deliberately empty, and the section does not render while it is.
//
// A story here is an endorsement: a named person, a number they earned, and a
// claim that Veyro is why. Writing plausible-looking ones would be inventing
// customers, and this site asks teenagers and their parents to connect a real
// bank account on the strength of what it says. So the slot exists and waits.
//
// To fill it, you need from each founder, in writing:
//   - permission to use their name, their words and their photo;
//   - a figure you can reconcile against their own payment records;
//   - for anyone under 18, the same permission from the guardian on the account.
//
// `amount` is free text so it can say "$2,140 in a week" or "first sale in two
// days" — whichever is true. `avatar` is a path under /public, or omit it and
// the card shows initials instead.

export type FounderStory = {
  /** Their name as they want it shown. First name is fine. */
  name: string;
  /** What they build and sell, in a few words. */
  building: string;
  /** Their own words. One or two sentences beats a paragraph. */
  quote: string;
  /** What they made, exactly as it can be substantiated. */
  amount?: string;
  /** Path under /public, e.g. "/founders/maya.jpg". */
  avatar?: string;
};

export const FOUNDER_STORIES: FounderStory[] = [];
