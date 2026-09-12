// Reconciling a connected account's state against Stripe.
//
// Webhooks are the fast path, but they get dropped, delayed, or fired while no
// listener is running. Nothing here depends on an event arriving: given a Stripe
// account id, syncAccountFromStripe() re-reads the live account and folds its
// state onto PaymentAccount. The webhook handler and the on-demand sync endpoint
// both call it, so there is one status mapping, not two that can drift.
//
// It also enforces the rule the product is built on: the verified individual on
// the Stripe account must be the guardian, not the (possibly minor) founder. If
// Stripe's onboarding form was completed by someone else, the account is held at
// RESTRICTED and never reaches ACTIVE in Veyro.
import type Stripe from "stripe";
import { stripe } from "./stripe";
import { db } from "./db";

export type ConnectStatus = "ACTIVE" | "RESTRICTED" | "REQUIREMENTS_DUE" | "PENDING";

export type RequirementInfo = { code: string; label: string };

// The fields the user must provide or fix right now. Read ONLY from the
// account's own top-level `requirements` — sub-objects like
// `external_accounts.data[].requirements` carry their own (usually empty) copies
// and must not be mixed in. `currently_due` and `past_due` are both "act now";
// `pending_verification` is Stripe working, not the user, and is excluded here.
function actionableRequirements(acct: Stripe.Account): string[] {
  const r = acct.requirements;
  return [...new Set([...(r?.currently_due ?? []), ...(r?.past_due ?? [])])];
}

function pendingRequirements(acct: Stripe.Account): string[] {
  return [...new Set(acct.requirements?.pending_verification ?? [])];
}

// Map a Stripe account's live state onto our enum.
//   RESTRICTED        — Stripe rejected or paused the account.
//   REQUIREMENTS_DUE  — there is something the USER must do (currently/past due).
//   ACTIVE            — charges and payouts both enabled, nothing outstanding.
//   PENDING           — nothing for the user to do: Stripe is verifying, or
//                       onboarding simply isn't finished.
export function deriveAccountStatus(acct: Stripe.Account): ConnectStatus {
  const disabledReason = acct.requirements?.disabled_reason ?? null;
  if (disabledReason && (disabledReason.startsWith("rejected") || disabledReason === "platform_paused")) {
    return "RESTRICTED";
  }

  if (actionableRequirements(acct).length > 0) return "REQUIREMENTS_DUE";

  if (acct.charges_enabled && acct.payouts_enabled) return "ACTIVE";

  return "PENDING";
}

// ---- plain-English requirement labels -------------------------------------
// A parent should never see "individual.id_number".

function nationalIdLabel(country: string): string {
  switch (country.toUpperCase()) {
    case "US": return "Your Social Security number (SSN)";
    case "CA": return "Your Social Insurance Number (SIN)";
    case "GB": return "Your National Insurance number";
    case "SG": return "Your NRIC or FIN";
    case "HK": return "Your Hong Kong ID number";
    case "AU": return "Your tax file number";
    default:   return "Your national ID number";
  }
}

export function humanizeRequirement(code: string, country: string): RequirementInfo {
  const fixed: Record<string, string> = {
    "individual.id_number_secondary": "A second government ID number",
    "individual.ssn_last_4": "The last 4 digits of your SSN",
    "individual.verification.document": "A photo of your government ID",
    "individual.verification.additional_document": "A second proof-of-identity document",
    "individual.dob.day": "Your date of birth",
    "individual.dob.month": "Your date of birth",
    "individual.dob.year": "Your date of birth",
    "individual.first_name": "Your legal first name",
    "individual.last_name": "Your legal last name",
    "individual.address.line1": "Your home address",
    "individual.address.line2": "Your home address",
    "individual.address.city": "Your home address",
    "individual.address.state": "Your home address",
    "individual.address.postal_code": "Your home postal code",
    "individual.phone": "Your phone number",
    "individual.email": "Your email address",
    "individual.political_exposure": "Whether you hold public office (politically exposed person)",
    "external_account": "A bank account for payouts",
    "tos_acceptance.date": "Accepting Stripe's terms of service",
    "tos_acceptance.ip": "Accepting Stripe's terms of service",
    "business_profile.url": "Your business website or product link",
    "business_profile.mcc": "What kind of business this is",
    "business_profile.product_description": "A description of what you sell",
    "business_profile.support_phone": "A customer support phone number",
    "business_profile.support_address": "A business support address",
  };

  if (code === "individual.id_number") return { code, label: nationalIdLabel(country) };
  if (fixed[code]) return { code, label: fixed[code] };

  // Unknown code — strip the API prefix, turn dots/underscores into spaces,
  // sentence-case. Still readable, never a raw path.
  const cleaned = code
    .replace(/^(individual|company|business_profile|tos_acceptance|relationship)\./, "")
    .replace(/[._]/g, " ")
    .trim();
  return { code, label: cleaned ? cleaned[0].toUpperCase() + cleaned.slice(1) : code };
}

// Humanize a list of codes, collapsing ones that share a label (dob.day/month/year).
export function describeRequirements(codes: string[], country: string): RequirementInfo[] {
  const seen = new Set<string>();
  const out: RequirementInfo[] = [];
  for (const code of codes) {
    const info = humanizeRequirement(code, country);
    if (seen.has(info.label)) continue;
    seen.add(info.label);
    out.push(info);
  }
  return out;
}

// ---- individual reconciliation ------------------------------------------------

export type IndividualMismatch = {
  field: "email" | "dob";
  expected: string;
  got: string;
};

function dobString(d: Stripe.Person.Dob | null | undefined): string | null {
  if (!d?.year || !d.month || !d.day) return null;
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

// Compare the person Stripe verified against the guardian we intended. Returns a
// mismatch only once the onboarding form carries something to check.
async function checkIndividual(
  businessId: string,
  acct: Stripe.Account,
): Promise<IndividualMismatch | null> {
  const ind = acct.individual;
  if (!ind) return null;

  const rel = await db.guardianRelationship.findUnique({ where: { businessId } });
  if (!rel?.guardianId) return null;
  const guardian = await db.user.findUnique({ where: { id: rel.guardianId } });
  if (!guardian) return null;

  if (ind.email) {
    const got = ind.email.trim().toLowerCase();
    const expected = guardian.email.trim().toLowerCase();
    if (got !== expected) return { field: "email", expected: guardian.email, got: ind.email };
  }

  const gotDob = dobString(ind.dob);
  if (gotDob && guardian.dateOfBirth) {
    const g = guardian.dateOfBirth;
    const expectedDob =
      `${g.getUTCFullYear()}-${String(g.getUTCMonth() + 1).padStart(2, "0")}-${String(g.getUTCDate()).padStart(2, "0")}`;
    if (gotDob !== expectedDob) return { field: "dob", expected: expectedDob, got: gotDob };
  }

  return null;
}

// ---- the reconcile itself ---------------------------------------------------

export type AccountSyncResult = {
  paymentAccountId: string;
  businessId: string;
  from: string;
  to: ConnectStatus;
  changed: boolean;
  /** Raw Stripe codes the user must act on (currently_due ∪ past_due). */
  requirementsDue: string[];
  /** The same, in plain English, deduped. */
  requirements: RequirementInfo[];
  /** Stripe is verifying these — nothing for the user to do. Plain English. */
  pendingVerification: RequirementInfo[];
  disabledReason: string | null;
  mismatch: IndividualMismatch | null;
};

/**
 * Re-read the connected account from Stripe and fold its state onto the matching
 * PaymentAccount row.
 *
 * Pass `known` (the account object off an `account.updated` event) to skip the
 * extra API round-trip. Returns `null` when no PaymentAccount row references this
 * Stripe account. Lets Stripe API errors propagate — the caller decides whether
 * that's a retry (webhook) or a 502 (endpoint).
 */
export async function syncAccountFromStripe(
  providerAccountId: string,
  known?: Stripe.Account,
): Promise<AccountSyncResult | null> {
  const account = await db.paymentAccount.findUnique({ where: { providerAccountId } });
  if (!account) return null;

  const acct = known ?? (await stripe.accounts.retrieve(providerAccountId));
  const country = acct.country ?? "US";

  const mismatch = await checkIndividual(account.businessId, acct);
  // A wrong individual overrides everything: the account does not go live.
  const to: ConnectStatus = mismatch ? "RESTRICTED" : deriveAccountStatus(acct);

  const dueCodes = actionableRequirements(acct);
  const pendingCodes = pendingRequirements(acct);
  const disabledReason = acct.requirements?.disabled_reason ?? null;

  await db.paymentAccount.update({
    where: { id: account.id },
    data: {
      status: to,
      requirementsDue: dueCodes as never,
      connectedAt: to === "ACTIVE" && !account.connectedAt ? new Date() : account.connectedAt,
      disconnectedAt: to === "ACTIVE" ? null : account.disconnectedAt,
    },
  });

  return {
    paymentAccountId: account.id,
    businessId: account.businessId,
    from: account.status,
    to,
    changed: to !== account.status,
    requirementsDue: dueCodes,
    requirements: describeRequirements(dueCodes, country),
    pendingVerification: describeRequirements(pendingCodes, country),
    disabledReason,
    mismatch,
  };
}
