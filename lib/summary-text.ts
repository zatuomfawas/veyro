// Fixed wording for the Annual Earnings & Payout Summary.
//
// In its own module, with no imports, for two reasons. It is counsel's text
// and belongs somewhere a reviewer can read without tracing a dependency
// graph; and a test that asserts the wording should not have to load Prisma to
// do it, which is exactly what happened when this lived beside the query that
// builds the document.
export const SUMMARY_DISCLAIMER =
  "This document is provided for informational and recordkeeping purposes only and does not "
  + "constitute tax, accounting or legal advice.";

/** The document's name, as the Terms give it. Not "annual statement". */
export const SUMMARY_TITLE = "Annual Earnings & Payout Summary";
