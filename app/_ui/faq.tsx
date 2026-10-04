import Link from "next/link";

// The FAQ, written once.
//
// It appears on the homepage and again at /faq. Two copies would drift: one
// would keep an answer that stopped being true, and the wrong one would be the
// one a worried parent read. `homepage` marks the subset the landing page
// shows; /faq shows everything.

export type FaqEntry = {
  q: string;
  a: React.ReactNode;
  /** Shown on the homepage as well as /faq. */
  homepage?: boolean;
};

export const FAQ: FaqEntry[] = [
  {
    q: "Does my parent own my business?",
    homepage: true,
    a: (
      <>
      No. They are the verified adult on the payment account, which is what the provider
      requires. Ownership of what you build is not something Veyro assigns to anyone, and
      the ledger is kept against you, not them.
      </>
    ),
  },
  {
    q: "Can my guardian stop a payout?",
    homepage: true,
    a: (
      <>
      No. On the account type this is built on, the
      guardian is notified of every payout request and keeps a permanent record, but the
      provider gives nobody a veto, so neither can we.
      </>
    ),
  },
  {
    q: "Does Veyro see my identity documents?",
    homepage: true,
    a: (
      <>
      Never. Identity checks happen on the provider&rsquo;s own hosted form. Veyro stores a
      reference to the account, not the documents, and not your bank details.
      </>
    ),
  },
  {
    q: "What does it cost?",
    
    a: (
      <>
      Nothing under $100 a month in earnings, which is most people. Above that, 3% on the
      amount over $100. It is one product either way: compliance monitoring, dispute handling,
      tax forms and support are included whether you are paying or not. Card processing fees
      are charged on top by the payment processor, which sets and deducts them, at every size.
      {/* The worked example reads as a figure rather than as a clause,
          because it is the part of this answer anyone actually checks. */}
      <span className="figrow" style={{ marginTop: "var(--sp-4)", display: "grid" }}>
        <span>
          <span className="fig-k">You earn</span>
          <span className="fig fig-sm">$400.00</span>
        </span>
        <span>
          <span className="fig-k">Veyro&rsquo;s fee</span>
          <span className="fig fig-sm">$9.00</span>
        </span>
        <span>
          <span className="fig-k">You keep</span>
          <span className="fig fig-sm fig-pos">$391.00</span>
        </span>
      </span>
      </>
    ),
  },
  {
    q: "How does age verification actually work?",
    
    a: (
      <>
      More weakly than the phrase suggests. The founder&rsquo;s birthdate is
      self-declared and is never verified independently: Veyro checks the full date
      against the 13 floor, but nobody confirms it is real. What gets checked is the
      <em> guardian&rsquo;s</em> identity, not the founder&rsquo;s age. This is weaker
      than it should be and will be tightened before launch.
      </>
    ),
  },
  {
    q: "What happens when I turn 18?",
    homepage: true,
    a: (
      <>
      Nothing automatic. The guardian&rsquo;s name stays on the payment
      account and the account itself does not change. It is something we will address
      before launch. Until then there is no handover, and it would be wrong to imply one.
      </>
    ),
  },
  {
    q: "Which countries are supported, and how do I check?",
    
    a: (
      <>
      Use the <Link className="linkbtn" href="/check">eligibility checker</Link>. Two
      questions and you will know immediately whether this works where you live,
      including when the answer is no. Brazil is excluded outright: account holders there
      must be 18 or over, guardian or no guardian.
      </>
    ),
  },
  {
    q: "Why does setup ask all these business-sounding questions?",
    
    a: (
      <>
      Because the adult on the account has to be verified, and the check has to understand
      what the business actually does. Those questions are required by law, and the form does not
      know it is looking at someone selling stickers. Your guardian fills them in, not
      you, and Veyro adds a line of plain guidance under each one.
      </>
    ),
  },
  {
    q: "Is this settled law?",
    homepage: true,
    a: (
      <>
      No. Provider policy permitting a minor to hold an account with a guardian as the
      verified adult is not the same as it being tested in court where you live. No lawyer
      has confirmed it in any country. That is a real limitation, and it belongs on the page
      rather than in a footnote.
      </>
    ),
  },
];
