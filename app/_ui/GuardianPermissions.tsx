// What a guardian is and is not, as a list rather than a paragraph.
//
// This is the most sensitive claim on the site: "your parent cannot block a
// payout" is the thing a founder most wants to hear and the thing a parent
// most needs to have stated accurately. A sentence buried in prose is easy to
// skim past and easy to misread in either direction, so it is a checklist.
//
// The first line reads "does the identity check", not "verifies your
// identity", and the difference is not pedantry. The guardian does not verify
// the founder — Stripe verifies the GUARDIAN, using the guardian's own
// documents, and the founder's age is self-declared with nobody checking it
// (/legal says so in as many words). "Verifies your identity" would promise a
// check on the founder that happens nowhere in this product, on the page a
// parent reads before putting their name on an account.
//
// "Does the identity check" carries the same meaning for the reader — the
// guardian is the one who goes through identity verification — without
// claiming whose identity got verified.

const DOES = [
  ["Does the identity check", "With their own ID, on Stripe's own form. Once, then never again."],
  ["Receives every payout notification", "Straight away, with a permanent record of it."],
  ["Is the verified adult on the account", "Stripe requires one behind every account. That is them."],
] as const;

const DOES_NOT = [
  ["Own your business", "Not your products, not your customers, not your ideas."],
  ["Approve your sales", "Nobody signs anything off. A sale is a sale."],
  ["Control your payouts", "Cannot block one, hold one or release one — not them, not Veyro."],
] as const;

export function GuardianPermissions({ compact = false }: { compact?: boolean }) {
  return (
    <div className={"gperm" + (compact ? " gperm-c" : "")}>
      <div className="gperm-col">
        <h3 className="gperm-h">Your guardian does</h3>
        <ul className="gperm-l">
          {DOES.map(([t, d]) => (
            <li key={t}>
              <span className="gperm-m gperm-yes" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <span><b>{t}</b><span className="gperm-d">{d}</span></span>
            </li>
          ))}
        </ul>
      </div>
      <div className="gperm-col">
        <h3 className="gperm-h">Your guardian does not</h3>
        <ul className="gperm-l">
          {DOES_NOT.map(([t, d]) => (
            <li key={t}>
              <span className="gperm-m gperm-no" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" /></svg>
              </span>
              <span><b>{t}</b><span className="gperm-d">{d}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
