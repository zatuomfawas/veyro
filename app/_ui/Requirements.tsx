import type { RequirementInfo } from "@/lib/stripe-account";

// What Stripe is still waiting for, in a form a parent can act on.
//
// The raw Stripe code is deliberately not shown. "business_profile.support_phone"
// tells a guardian nothing they can use, and printing it next to the label made
// the list read like a stack trace. Where a code has guidance in
// lib/stripe-account.ts's HINTS, that sentence takes the second line instead;
// where it does not, the label stands alone.
export function Requirements({ items }: { items: RequirementInfo[] }) {
  if (items.length === 0) return null;
  return (
    <div className="reqlist">
      {items.map((r) => (
        <div className="reqrow" key={r.code}>
          <div>
            <span className="req-t">{r.label}</span>
            {r.hint && <span className="req-d">{r.hint}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
