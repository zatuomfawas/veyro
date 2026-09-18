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
      No, and we will not pretend otherwise. On the account type this is built on, the
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
    homepage: true,
    a: (
      <>
      Veyro takes no percentage of what you earn today. Stripe charges its own fees on
      each transaction, which Stripe sets and deducts. Future pricing is undecided; if it
      ever changes you will be told before it applies to you.
      </>
    ),
  },
  {
    q: "How does age verification actually work?",
    homepage: true,
    a: (
      <>
      Honestly, more weakly than the phrase suggests. The founder&rsquo;s birthdate is
      self-declared and is never verified independently: Veyro checks the full date
      against the 13 floor, but nobody confirms it is real. Stripe verifies the
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
      Nothing, yet. This has not been built. The guardian&rsquo;s name stays on the Stripe
      account and the account itself does not change. It is something we will address
      before launch, and we would rather say that than imply a handover that does not
      exist.
      </>
    ),
  },
  {
    q: "Which countries are supported, and how do I check?",
    homepage: true,
    a: (
      <>
      Use the <Link className="linkbtn" href="/check">eligibility checker</Link>. Two
      questions and you will know immediately whether this works where you live,
      including when the answer is no. Brazil is excluded outright: Stripe requires
      account holders there to be 18 or over, guardian or no guardian.
      </>
    ),
  },
  {
    q: "Why does Stripe ask all these business-sounding questions?",
    homepage: true,
    a: (
      <>
      Because Stripe verifies the adult on the account and has to understand what the
      business actually does. They are required to ask by law, and their form does not
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
      has confirmed it in any country, and we would rather write that here than let you
      assume otherwise.
      </>
    ),
  },
];
