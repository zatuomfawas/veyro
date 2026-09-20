"use client";

import { useState } from "react";

// All-time or this month.
//
// Both figures arrive already computed from the server, so switching is a state
// change rather than a refetch. The number is the largest thing on the page
// because it is the thing the founder came to see.
export default function RevenueToggle({
  allTime, thisMonth,
}: { allTime: string; thisMonth: string }) {
  const [month, setMonth] = useState(false);

  return (
    <div>
      {/* Sized with clamp rather than a fixed --fs-10. At 56px a six-figure
          total is wider than a phone-width card, and the global
          overflow-wrap:break-word then splits it mid-figure: "$1,000,1" above
          "24.99". It never overflowed, which is why a scroll check missed it,
          but a broken money figure is not a number anyone should have to
          reassemble. Shrinking to fit keeps it whole; break-word stays as the
          last resort for a total large enough to defeat even that. */}
      <span
        className="num"
        style={{
          fontSize: "clamp(30px, 9vw, var(--fs-10))",
          fontWeight: "var(--fw-bold)",
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          display: "block",
        }}
      >
        {month ? thisMonth : allTime}
      </span>

      <div className="row" style={{ marginTop: "var(--sp-2)", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span className="tiny">Earned</span>
        <span role="group" aria-label="Period" style={{ display: "inline-flex", gap: 4 }}>
          <button
            type="button"
            className={"btn btn-sm " + (month ? "btn-q" : "btn-2")}
            aria-pressed={!month}
            onClick={() => setMonth(false)}
          >
            All time
          </button>
          <button
            type="button"
            className={"btn btn-sm " + (month ? "btn-2" : "btn-q")}
            aria-pressed={month}
            onClick={() => setMonth(true)}
          >
            This month
          </button>
        </span>
      </div>
    </div>
  );
}
