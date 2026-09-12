# Copy fixes: "approves" → "is notified"

With Stripe **Standard** accounts, the connected account controls its own payout
schedule. Veyro cannot block a payout. The guardian gets visibility and a record,
not a veto.

Your terms page and the amber "What Veyro can and cannot enforce" panel already
say this correctly. Leave both alone. The strings below are the ones that
currently promise a gate that does not exist.

Each entry: the line number in `veyro.jsx`, what it says now, what it should say.

---

## 1. Line 5084 — the worst one

This is a flatly false statement shown to a guardian while they choose settings.

**Now:**
```
title="Approve every payout" sub="Nothing reaches your bank account without you saying yes."
```

**Change to:**
```
title="Tell me about every payout" sub="You get a notification the moment any payout starts."
```

Also at line 5085, the threshold option:

**Now:** `approvePayouts: true, thresholdMinor: usd(100)`
**Keep the values**, but change its visible title/sub to:
```
title="Only larger payouts" sub="You're notified when a payout is over your limit."
```

---

## 2. Line 3673 — what the guardian takes on

**Now:**
```
"Approve payouts to your bank account"
```

**Change to:**
```
"See every payout, and every change to the account"
```

---

## 3. Line 3700 — how the money moves

**Now:**
```
When {founder} requests a payout, you approve it and the
money lands in your bank account. Veyro records every step so both of you can see the same history.
```

**Change to:**
```
When a payout happens, Veyro tells you straight away and records it. The money lands in the
bank account on the Stripe account. Veyro records every step so both of you can see the same history.
```

---

## 4. Line 2609 — the landing page row

**Now:**
```
<Row left="Approves every payout" sub="Recorded, with a timestamp" />
```

**Change to:**
```
<Row left="Sees every payout" sub="Notified, and recorded with a timestamp" />
```

---

## 5. Line 4468 — the founder's payout screen

**Now:**
```
{rel.guardianName} approves it first, and the request and their decision are both recorded.
```

**Change to:**
```
{rel.guardianName} is notified, and the payout is recorded for both of you.
```

---

## 6. Line 4690 — the policy summary

**Now:** shows `"Every payout"` / `"No approval needed"`

**Change to:** `"Notified of every payout"` / `"Notified of larger payouts"` / `"Not notified"`

---

## 7. Line 1644 — the SEO page title

**Now:**
```
"How Veyro works, payments for young founders, with guardian approval"
```

**Change to:**
```
"How Veyro works, payments for young founders, with a guardian involved"
```

---

## Notification text

Anywhere a notification says "Approval needed" or "Payout needs your approval",
change to "Payout started" — because nothing is waiting on the guardian.

Line 4873's label map: `"payout.approved": "Payout approved"` can stay for
historical records, but new events should use a `payout.started` label.

---

## One thing to check, not a copy fix

`app/api/business/[businessId]/connect-stripe/route.ts` creates the Stripe
account with `email: user.email` — and `user` there is whoever calls the
endpoint, which is the **founder**.

That means the Stripe login likely belongs to the founder, while the copy tells
the guardian they are "the named adult on the payment account." Whoever
completes Stripe's onboarding form becomes the `individual` on the account, so
these may or may not match depending on who actually filled it in.

Worth confirming before any real user touches this: check
`https://api.stripe.com/v1/accounts/<acct_id>` and look at `email` and
`individual`. If the founder holds the login, either the flow should hand
onboarding to the guardian, or the copy should say the founder holds the
account with the guardian named on it. Right now it's ambiguous, and for a
product about guardian consent, ambiguity there is the wrong kind.
