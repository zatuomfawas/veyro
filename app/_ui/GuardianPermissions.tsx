// What a guardian is and is not, as a list rather than a paragraph.
//
// This is the most sensitive claim on the site: it is the thing a founder most
// wants to hear and the thing a parent most needs stated accurately. As prose
// it was one clause in a paragraph, easy to skim past and easy to misread in
// either direction, so it is two columns with coloured marks.
//
// Two things it deliberately does not say.
//
// It does not say the guardian cannot veto a payout. That was the old wording
// and it is the wrong frame twice over: it alarms the parent reading it, and it
// overstates the position. The guardian owns the account and can close or
// freeze it whenever they like. What they do not do is approve each payout.
// Approve once, then stay out of the way -- which is accurate, and is also the
// thing a teenager actually wants.
//
// And it does not say "verifies your identity". The guardian does not verify
// the founder; it is the GUARDIAN who gets verified, with the guardian's own
// documents, and the founder's age is self-declared with nobody checking it
// (/legal says so in as many words). "Does the identity check" carries the
// same meaning for a reader without claiming whose identity got checked.
//
// The processor is not named in these six lines. This block renders on
// /for-parents and on /how-it-works, and on both of them the question is what
// the adult is signing up for, not whose rails it runs on. Naming them here
// invites "then I will just open one myself", which is the objection the
// whole site is built to answer. /how-it-works names them in its own
// architecture section, which is where that belongs.

const DOES = [
  ["Does the identity check", "With their own ID, on a secure form Veyro never sees. Once, then never again."],
  ["Owns the account", "The payment account is in their name. That is the part that makes this lawful."],
  ["Can close or freeze it", "At any time, and not through us. Nothing in Veyro prevents it."],
] as const;

const DOES_NOT = [
  ["Own your business", "Not your products, not your customers, not your ideas."],
  ["Approve each sale", "Nobody signs anything off. A sale is a sale."],
  ["Approve each payout", "They verify once at setup. After that you move your own money without asking."],
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
