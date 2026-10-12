// The provider's written reply, in one place.
//
// This is the single most valuable thing Veyro owns. A competitor can copy the
// dashboard, the checkout and the wording of this site in an afternoon; none of
// them can copy a dated written answer from the payment provider saying a
// thirteen-year-old may hold an account. The whole product rests on it.
//
// It lived as string constants inside app/how-it-works/page.tsx, which was
// fine while that was the only page quoting it. The homepage quotes the core
// sentence now, and two copies of a quotation is how one of them quietly stops
// matching the original. Quoted material gets the same treatment as money in
// this codebase: one definition, imported everywhere it appears.
//
// NOTHING HERE IS EDITED. Not for length, not for house style, not to read
// better. DESIGN.md's em dash rule explicitly does not govern quoted material,
// and neither does anything else: these are somebody else's words and they are
// reproduced as received. If a sentence here needs context, the context goes
// around the quote, never inside it.

/** The date the reply was received, as every page states it. */
export const REPLY_DATE = "8 September 2026";

/** The sentence the product rests on. */
export const Q_CORE =
  "A user who is at least 13 years old can create a Connect account, and where the user is " +
  "under 18, the required parent or legal guardian involvement must be completed through " +
  "Stripe's onboarding process before the account can accept charges or receive payouts.";

export const Q_TYPES =
  "The current guidance is that Standard, Express, and Custom Connect accounts can support " +
  "users aged 13–17 with legal guardian involvement, subject to country availability. If you " +
  "have come across older information indicating an 18+ minimum for Express or Custom accounts, " +
  "please follow the current Help Center guidance.";

export const Q_COUNTRIES =
  "For your planned launch countries, the US is supported under this process. Country-specific " +
  "requirements may apply, and availability for certain minor onboarding flows can vary by " +
  "country. Brazil remains an exception where users must be at least 18 years old.";

export const Q_ONBOARDING =
  "We recommend using Stripe-hosted onboarding or embedded onboarding components so that Stripe " +
  "can collect and verify the required information directly. These onboarding flows automatically " +
  "reflect current verification and compliance requirements.";

export const Q_ARCHITECTURE =
  "From the architecture you've outlined, using Stripe-hosted onboarding for identity " +
  "verification while not handling identity documents, banking credentials, or funds directly is " +
  "the recommended approach.";

export const HELP_AGE =
  "https://support.stripe.com/questions/age-requirement-to-create-a-stripe-account";
export const HELP_VERIFY =
  "https://support.stripe.com/questions/us-verification-requirements-for-platforms-with-custom-accounts-faq";
