import { permanentRedirect } from "next/navigation";

// Was the parents' page; its content is now /for-parents, rewritten around the
// four questions a parent actually asks and with the payout wording corrected.
//
// A redirect rather than a copy: the old URL is in the guardian invitation
// emails that have already been sent, and two pages making claims about
// liability is exactly the pair that drifts apart.
export default function ForGuardians() {
  permanentRedirect("/for-parents");
}
