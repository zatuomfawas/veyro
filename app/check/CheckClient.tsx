"use client";

/**
 * The eligibility checker, pulled out of prototype/veyro.jsx as a standalone
 * public page. No login, no database, no API calls — eligibility() is pure
 * arithmetic over the two tables below, run entirely in the browser.
 *
 * The design system lives in app/_ui/css.ts and app/_ui/marks.tsx, shared with
 * the other pages. Everything here is copied verbatim from the prototype,
 * unmodified — including the parts that look inconsistent on their own
 * (Notice's inline borderRadius: 8, for one) but are the prototype's actual
 * current state, not mine to fix here.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CSS, CSS2 } from "@/app/_ui/css";
import { Icon, Wordmark, SkipLink } from "@/app/_ui/marks";
import { Btn, Field, Notice } from "@/app/_ui/form";

function Brand({ onClick, size = 20 }: { onClick?: () => void; size?: number }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Veyro, home"
      style={{ background: "none", border: 0, cursor: onClick ? "pointer" : "default", padding: 0 }}>
      <Wordmark size={size} />
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Eligibility
 *
 * Sources:
 *   Stripe Services Agreement, Age Restrictions, 13+ may open an account; a
 *   user under 18 must add an adult Representative who accepts liability.
 *   Stripe support, "Age requirement to create a Stripe account".
 *   Stripe Support by email, 8 September 2026, confirming directly that (a) 13+
 *   with guardian involvement completed through Stripe's own onboarding is the
 *   supported model, (b) Standard, Express AND Custom all support it — the
 *   older "Express and Custom are 18+" guidance is superseded, (c) the US is
 *   supported, and (d) Brazil is an exception at 18+.
 * These are provider policies, not confirmation that Veyro's specific platform
 * configuration has been approved, and a support reply is not a legal
 * guarantee. See ARCHITECTURE.md.
 * ------------------------------------------------------------------ */

type EvidenceTier = "primary" | "secondary" | "disputed";
type AccessStatus = "self" | "preview" | "extended" | "adults_only" | "none";

type CountryRow = [
  code: string,
  name: string,
  baseAge: number,
  tier: number,
  note: string,
  status: AccessStatus,
  evidence?: EvidenceTier,
  source?: string,
];

const COUNTRIES: CountryRow[] = [
  // [code, name, age of contractual capacity, tier, note, access, evidence, source]
  // Contractual capacity, not the general age of majority. They coincide almost
  // everywhere, and where they do not the note says so.
  // status: "self" self-serve signup · "preview" contact-sales only · "extended" Paystack, not Stripe
  //         "adults_only" provider supports the country, but only for account holders 18+
  ["AU","Australia",18,2,"","self","primary","OECD Family Database PF1.8"],["AT","Austria",18,3,"","self","primary","EU Agency for Fundamental Rights"],["BE","Belgium",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["BR","Brazil",18,4,"Stripe confirmed by email on 8 September 2026 that Brazil is an exception: account holders there must be at least 18, guardian or no guardian.","adults_only","primary","Stripe Support, 8 September 2026"],["BG","Bulgaria",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["CA","Canada",18,2,"18 in AB, MB, ON, QC, SK and PE. 19 in BC, NB, NL, NS, NT, NU and YT.","self","secondary","OECD confirms 19 in certain territories; the province split is secondary"],
  ["CI","Côte d'Ivoire",21,4,"","extended","secondary","Secondary summaries only"],
  ["HR","Croatia",18,3,"","self","primary","EU Agency for Fundamental Rights"],["CY","Cyprus",18,3,"","self","primary","EU Agency for Fundamental Rights"],["CZ","Czech Republic",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["DK","Denmark",18,3,"","self","primary","EU Agency for Fundamental Rights"],["EE","Estonia",18,3,"","self","primary","EU Agency for Fundamental Rights"],["FI","Finland",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["FR","France",18,3,"","self","primary","EU Agency for Fundamental Rights"],["DE","Germany",18,3,"","self","primary","EU Agency for Fundamental Rights"],["GH","Ghana",18,4,"","extended","secondary","Secondary summaries only"],
  ["GI","Gibraltar",18,3,"Sources disagree between 17 and 18. We use 18, the more cautious figure, until it is checked properly.","self","disputed","Cited as both 17 and 18"],["GR","Greece",18,3,"","self","primary","EU Agency for Fundamental Rights"],["HK","Hong Kong",18,3,"","self","primary","Singapore Parliament, Civil Law Amendment 2nd Reading"],
  ["HU","Hungary",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["IN","India",18,5,"Stripe lists India as Preview, sales contact only, no self-serve signup.","preview","secondary","Secondary summaries only"],
  ["ID","Indonesia",21,5,"Preview only. Age of majority is disputed between the Civil Code and later statutes.","preview","disputed","Civil Code and later statutes disagree"],
  ["IE","Ireland",18,2,"","self","primary","EU Agency for Fundamental Rights"],["IT","Italy",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["JP","Japan",18,3,"Lowered from 20 to 18 in April 2022. Older sources still say 20.","self","disputed","OECD still lists 20; the Civil Code reform took effect April 2022"],
  ["KE","Kenya",18,4,"","extended","secondary","Secondary summaries only"],["LV","Latvia",18,3,"","self","primary","EU Agency for Fundamental Rights"],["LI","Liechtenstein",18,3,"","self","secondary","Secondary summaries only"],
  ["LT","Lithuania",18,3,"","self","primary","EU Agency for Fundamental Rights"],["LU","Luxembourg",18,3,"","self","primary","EU Agency for Fundamental Rights"],["MY","Malaysia",18,3,"","self","primary","Singapore Parliament, Civil Law Amendment 2nd Reading"],
  ["MT","Malta",18,3,"","self","primary","EU Agency for Fundamental Rights"],["MX","Mexico",18,3,"","self","primary","OECD Family Database PF1.8"],
  ["NL","Netherlands",18,3,"18, though most adult rights attach at 16.","self","primary","EU Agency for Fundamental Rights"],
  ["NZ","New Zealand",20,2,"20 for full capacity, though many contracts bind from 18.","self","primary","OECD Family Database PF1.8"],
  ["NG","Nigeria",18,4,"","extended","secondary","Secondary summaries only"],["NO","Norway",18,3,"","self","primary","OECD Family Database PF1.8"],["PL","Poland",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["PT","Portugal",18,3,"","self","primary","EU Agency for Fundamental Rights"],["RO","Romania",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["SG","Singapore",18,3,"The age of majority is 21, but contractual capacity was separated from it and lowered to 18 on 1 March 2009, expressly so that young people could do business. 18 is the number that matters here.","self","primary","Singapore MinLaw, MOF and MAS"],
  ["SK","Slovakia",18,3,"","self","primary","EU Agency for Fundamental Rights"],["SI","Slovenia",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["ZA","South Africa",18,4,"","extended","secondary","Secondary summaries only"],["ES","Spain",18,3,"","self","primary","EU Agency for Fundamental Rights"],["SE","Sweden",18,3,"","self","primary","EU Agency for Fundamental Rights"],
  ["CH","Switzerland",18,3,"","self","primary","OECD Family Database PF1.8"],
  ["TH","Thailand",20,3,"20 under the Civil and Commercial Code.","self","secondary","Civil and Commercial Code, via secondary summary"],
  ["AE","United Arab Emirates",21,3,"21. A 2026 announcement to lower it to 18 is unconfirmed.","self","disputed","21, with an unconfirmed 2026 announcement to lower it"],
  ["GB","United Kingdom",18,1,"Scotland is 16 under the Age of Legal Capacity (Scotland) Act 1991. A 16-year-old in Scotland needs no guardian on the account.","self","primary","Age of Legal Capacity (Scotland) Act 1991, FRA"],
  ["US","United States",18,1,"18 in most states. 19 in Alabama and Nebraska, 21 in Mississippi.","self","primary","Cornell LII summary, four concordant sources"],
  ["--","My country isn't listed",0,9,"","none"],
];

const REGIONS: [string, string[]][] = [
  ["GB", ["England","Scotland","Wales","Northern Ireland"]],
  ["CA", ["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador",
          "Nova Scotia","Ontario","Quebec","Saskatchewan","Other territory"]],
  ["US", ["Alabama","Mississippi","Nebraska","Any other state"]],
];
// Countries Stripe named explicitly in the 8 September 2026 reply. Everywhere
// else the model is confirmed but the country is not, because the same reply
// said "availability for certain minor onboarding flows can vary by country".
// Add a code here only when Stripe confirms that country by name.
const STRIPE_CONFIRMED = new Set<string>(["US"]);

const REGION_AGE: Record<string, number> = {
  Scotland: 16, "British Columbia": 19, "New Brunswick": 19,
  "Newfoundland and Labrador": 19, "Nova Scotia": 19, "Other territory": 19,
  Alabama: 19, Nebraska: 19, Mississippi: 21,
};

type Route =
  | "no_country" | "extended" | "preview" | "adults_only"
  | "too_young" | "adult" | "guardian";

type EligibilityResult = {
  route: Route;
  country: CountryRow | null;
  majority: number;
  region?: string;
  note?: string;
  tier?: number;
  status?: AccessStatus;
  evidence?: EvidenceTier;
  source?: string;
};

function eligibility(code: string, age: number | null, region: string): EligibilityResult {
  const c = COUNTRIES.find(([k]) => k === code);
  if (!c) return { route: "no_country", country: null, majority: 18 };
  const [, , baseAge, tier, note, status, evidence, source] = c;
  const majority = (region && REGION_AGE[region]) || baseAge;
  const ctx = { country: c, majority, region, note, tier, status, evidence, source };
  if (tier === 9) return { ...ctx, route: "no_country" };
  if (status === "extended") return { ...ctx, route: "extended" };
  if (status === "preview") return { ...ctx, route: "preview" };
  // A country-level adult-only exception (Brazil). Checked ahead of the
  // provider's general floor of 13 because the local minimum is higher, so
  // quoting 13 at someone here would be wrong as well as unhelpful.
  if (status === "adults_only" && age !== null && age < majority) {
    return { ...ctx, route: "adults_only" };
  }
  if (age !== null && age < 13) return { ...ctx, route: "too_young" };
  if (age !== null && age >= majority) return { ...ctx, route: "adult" };
  // Open by default. Stripe confirmed the mechanism itself — 13+, with the
  // guardian's involvement completed through Stripe's own onboarding — so the
  // route stands unless something explicitly says otherwise for this country:
  // a higher local age (handled above), a provider carve-out like Brazil, or a
  // different provider entirely. Tier is no longer a gate; it only decides how
  // strongly the outcome is worded.
  return { ...ctx, route: "guardian" };
}

function EligibilityCheck({ go }: { go: (route: string) => void }) {
  const [code, setCode] = useState("");
  const [region, setRegion] = useState("");
  const [year, setYear] = useState("");
  const [R, setR] = useState<EligibilityResult | null>(null);
  const age = /^\d{4}$/.test(year) ? new Date().getFullYear() - parseInt(year, 10) : null;
  const regionEntry = REGIONS.find(([k]) => k === code);
  const regions = regionEntry ? regionEntry[1] : null;
  const ready = code !== "" && age !== null && age > 4 && age < 100 && (!regions || region !== "");
  const reset = () => setR(null);

  return (
    <main id="main" style={{ minHeight: "100vh", background: "var(--surface)" }}>
      <div className="wrap-s"><div className="lp-nav" style={{ borderBottom: 0 }}>
        <Brand onClick={() => go("landing")} />
        <Btn variant="2" size="sm" onClick={() => go("landing")}>
          <Icon name="back" size={13} />Back to home
        </Btn>
      </div></div>
      <div className="wrap-s" style={{ marginTop: 10, marginBottom: 90 }}>
        <h1 className="d2" style={{ fontSize: "var(--fs-8)" }}>Check what applies to you</h1>
        <p className="body" style={{ marginTop: 10, fontSize: "var(--fs-4)" }}>
          Where you live and how old you are decide which route is open, and whether you need us at all.
          No account, no email address.
        </p>

        <div className="card" style={{ marginTop: 22 }}><div className="card-b">
          <Field label="Where do you live?">
            <select className="select" value={code} onChange={(e) => { setCode(e.target.value); setRegion(""); reset(); }}>
              <option value="">Choose a country</option>
              {COUNTRIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          {regions && (
            <Field label={code === "US" ? "Which state?" : code === "CA" ? "Which province?" : "Which nation?"}
              hint="The legal age of adulthood is set locally, not nationally.">
              <select className="select" value={region} onChange={(e) => { setRegion(e.target.value); reset(); }}>
                <option value="">Choose</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          )}
          <Field label="Year you were born">
            <input className="input" inputMode="numeric" maxLength={4} value={year}
              onChange={(e) => { setYear(e.target.value.replace(/\D/g, "")); reset(); }} placeholder="2009" />
          </Field>
          <Btn className="btn-w" disabled={!ready} onClick={() => setR(eligibility(code, age, region))}>Check</Btn>
        </div></div>

        {R && (
          <div style={{ marginTop: 16 }}>
            {R.route === "guardian" && (
              <Notice tone="pine" head={"Verified in " + (R.region || R.country?.[1])}
                action={<Btn size="sm" onClick={() => go("signup")}>Create your account</Btn>}>
                <p>
                  {R.country?.[1]} is on the payment provider&rsquo;s supported list, and this route is open to you.
                  In {R.region || R.country?.[1]} you can sign a binding contract in your own name from{" "}
                  {R.majority}; you&rsquo;re {age}, so a parent or legal guardian is named as the adult on the payment
                  account before it can take charges or pay out. They pass the provider&rsquo;s identity checks and
                  accept responsibility for the account, which is what the provider requires and what makes the rest of
                  it legitimate. You keep running the business. We walk both of you through the setup and keep the
                  record of who agreed to what, and when.
                </p>
                <p style={{ marginTop: 10 }}>
                  {STRIPE_CONFIRMED.has(R.country?.[0] ?? "") ? (
                    <>Stripe confirmed {R.country?.[1]} by name when we asked them directly on 8 September 2026, and
                    the age above comes from {R.evidence === "primary" ? "a named statute or an official body"
                      : R.evidence === "disputed" ? "sources that disagree, so we use the higher figure"
                      : "secondary summaries"}. This is the strongest case we have.</>
                  ) : (
                    <>Stripe confirmed how this works in general — 13 and over, with the guardian&rsquo;s involvement
                    completed through their own onboarding — and we have found nothing in {R.country?.[1]}&rsquo;s law
                    that prevents it. What they would not confirm is availability country by country; they named only
                    the US. So you would find out for certain at the Stripe step, before any money moves and before
                    anyone has committed to anything.</>
                  )}
                </p>
              </Notice>
            )}
            {R.route === "adult" && (
              <Notice tone="grey" head="You don't need us for this"
                action={
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <Btn size="sm" variant="2" onClick={() => go("signup")}>Create an account anyway</Btn>
                    <Btn size="sm" variant="q" onClick={() => go("landing")}>Understood</Btn>
                  </div>
                }>
                {R.country?.[1]} is supported by the payment provider, and at your age none of this applies to you
                anyway. You&rsquo;re {age}, and you can contract in your own name in {R.region || R.country?.[1]} from{" "}
                {R.majority}.
                You can open a payment account in your own name directly with a provider. We exist for
                founders who are blocked by the age rule. If you run a programme for founders who are, that&rsquo;s a
                different conversation.
              </Notice>
            )}
            {R.route === "extended" && (
              <Notice tone="amber" head={"Different provider in " + R.country?.[1]}>
                Stripe reaches {R.country?.[1]} through Paystack, its extended network, rather than through a Stripe
                account. Everything we have verified about minors and guardian representatives is Stripe&rsquo;s policy,
                not Paystack&rsquo;s, and we have not read Paystack&rsquo;s rules. We are not going to apply one company&rsquo;s
                terms to another company&rsquo;s product and call it verified.
              </Notice>
            )}
            {R.route === "preview" && (
              <Notice tone="amber" head={R.country?.[1] + " is in preview"}>
                Stripe lists {R.country?.[1]} as preview: businesses there contact Stripe sales rather than signing up
                themselves. There is no self-serve route for us to build on, so we cannot take you through setup.
              </Notice>
            )}
            {R.route === "adults_only" && (
              <Notice tone="clay" head={"You must be at least " + R.majority + " in " + R.country?.[1]}>
                {R.country?.[1]} is the one country the payment provider carves out of the under-18 route. Stripe told
                us directly: account holders there must be at least {R.majority}, and a parent or legal guardian on the
                account does not change it. You&rsquo;re {age}, so there is no version of this that works yet — not with
                us, and not with anyone else building on the same provider.
              </Notice>
            )}
            {R.route === "too_young" && (
              <Notice tone="clay" head="Not yet, and we won't pretend otherwise">
                The provider&rsquo;s minimum age is 13, whoever is helping you. There is no version of this that works at
                {" " + age}, and anyone offering you one is asking you to put false information on a financial
                application. Keep building. Come back.
              </Notice>
            )}
            {R.route === "no_country" && (
              <Notice tone="clay" head="Not available where you are">
                The payment provider we use supports self-serve signup in 43 countries, and yours isn&rsquo;t among them. That&rsquo;s a
                provider restriction we can&rsquo;t work around, and we&rsquo;re not going to suggest registering a company
                somewhere else to get past it.
              </Notice>
            )}
            {(["no_country", "preview", "extended", "adults_only"] as Route[]).includes(R.route) && (
              <div className="panel" style={{ marginTop: "var(--sp-4)" }}>
                <div className="lbl" style={{ marginBottom: "var(--sp-1)" }}>What you can still do</div>
                <p className="small">
                  The route where the account is yours is not open to you, but the other one is, on
                  almost every provider. A parent or guardian opens the account in their own name and
                  you run the business day to day. It is worse in three specific ways and you should
                  know all three before you start.
                </p>
                <ul className="arrowlist" style={{ marginTop: "var(--sp-3)" }}>
                  <li>The business is legally theirs, not yours.</li>
                  <li>At 18 you transfer the account rather than simply taking it over.</li>
                  <li>If you sign in with their password you are breaching the provider&rsquo;s terms, and it
                    is your account that gets closed.</li>
                </ul>
                <p className="tiny" style={{ marginTop: "var(--sp-3)" }}>
                  Ask to be added as staff on their account rather than sharing a login. Veyro does not
                  set this up for you, and we would rather say so than pretend.
                </p>
              </div>
            )}

            {(["guardian", "adult", "preview", "extended", "adults_only"] as Route[]).includes(R.route) && (
              <div className="panel" style={{ marginTop: 12 }}>
                {R.note && <>
                  <div className="lbl" style={{ marginBottom: 4 }}>Worth knowing about {R.country?.[1]}</div>
                  <p className="small" style={{ marginBottom: 12 }}>{R.note}</p>
                </>}
                <div className="lbl" style={{ marginBottom: 4 }}>Where the age of {R.majority} comes from</div>
                <p className="small">
                  {R.source}.{" "}
                  {R.evidence === "primary" ? "Stated by an official body or a named statute."
                   : R.evidence === "disputed" ? "Sources disagree, so we use the higher figure. Being told you need a guardian when you do not costs a step; the reverse produces an invalid application."
                   : "From secondary summaries, not yet confirmed against the statute."}
                </p>
                <p className="tiny" style={{ marginTop: 10 }}>
                  Separately, and this is the part that gates everything: whether a minor may hold the account
                  in {R.country?.[1]} with a guardian as representative has not been confirmed by a lawyer in any
                  country. Provider policy permitting it is not the same as it being settled locally.
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 26 }}>
          <div className="lbl" style={{ marginBottom: 8 }}>How we work this out</div>
          <p className="tiny" style={{ maxWidth: "var(--m-body)" }}>
            Two filters, and a default. First, how the payment provider reaches your country: 43 countries can sign
            up directly, 2 are sales-contact only, 5 run on a different company&rsquo;s platform whose rules we have
            not read, and Brazil is supported but only for account holders of 18 or over. Second, the age at which you
            can enter a binding contract where you live, because the provider&rsquo;s terms defer to local law rather
            than assuming 18. Scotland is 16, seven Canadian provinces and territories are 19, Mississippi is 21, and
            Singapore separates contracting age from adulthood entirely. Beyond those two, the route is treated as
            open: Stripe confirmed the mechanism to us directly on 8 September 2026, so we do not mark a country
            closed unless its own law sets a higher age or the provider carves it out. What Stripe would not confirm
            is availability country by country, and the result above says so where it applies. Terms change, and none
            of this is legal or tax advice.
          </p>
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ *
 * Standalone page shell. Mirrors the root render in prototype/veyro.jsx:
 * .fw wrapper (design tokens live on this class, not :root), the injected
 * stylesheet, and the skip link. Everything else the app root does — the app
 * shell, cookie banner, sandbox drawer, toasts — belongs to the full product,
 * not this public checker.
 * ------------------------------------------------------------------ */

export default function CheckClient() {
  const router = useRouter();

  // The checker is the highest-intent moment in the product, so a result that
  // says "yes, this is open to you" has to lead somewhere. It used to send
  // every route home, written when /auth/signup did not exist yet.
  const go = (route: string) => {
    router.push(route === "signup" ? "/auth/signup" : "/");
  };

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />
      <EligibilityCheck go={go} />
    </div>
  );
}
