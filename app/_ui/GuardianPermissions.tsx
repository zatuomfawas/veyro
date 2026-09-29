// What a guardian is and is not, as a list rather than a paragraph.
//
// This is the most sensitive claim on the site: "your parent cannot block a
// payout" is the thing a founder most wants to hear and the thing a parent
// most needs to have stated accurately. A sentence buried in prose is easy to
// skim past and easy to misread in either direction, so it is a checklist.
//
// One correction worth recording, because it is the obvious way to write this
// and it is wrong: the guardian does NOT verify the founder's identity. Stripe
// verifies the GUARDIAN, with the guardian's own documents. The founder's age
// is self-declared and nobody checks it — see /legal. Writing "verifies your
// identity" here would claim an identity check on the founder that does not
// happen anywhere in this product.

const DOES = [
  ["Is the adult Stripe verifies", "With their own ID, on Stripe's own form. Once."],
  ["Hears about every payout you request", "Straight away, with a permanent record of it."],
  ["Is on the account, legally", "Stripe requires a verified adult behind it. That is them."],
] as const;

const DOES_NOT = [
  ["Own your business", "Not your products, not your customers, not your ideas."],
  ["Approve your sales", "Nobody signs anything off. A sale is a sale."],
  ["Block or control your payouts", "On this account type nobody can — not them, not Veyro."],
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
