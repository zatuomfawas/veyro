import { formatMinor } from "@/lib/money";
import { FREE_LIMIT_MINOR } from "@/lib/fees";

// What this month has earned, and what Veyro has charged for it.
//
// Shown whether or not fee collection is on. With it off the figure is what
// the fee WOULD be, labelled as such -- that is how the engine gets verified
// against real traffic before anybody is charged, and it means a founder is
// never surprised by a number appearing for the first time on 5 November.
//
// The crossing notice (F2) lives here rather than in its own banner because
// this is where somebody looks to find out where they stand. It is a fact
// about their month, not an offer: no button, no "upgrade", nothing to accept.
// The services simply apply in a month they are over the line.

export function ThisMonth({
  qmeMinor, feeMinor, currency, collecting, crossed, feesStart,
}: {
  qmeMinor: number;
  feeMinor: number;
  currency: string;
  /** False until fee collection is lawfully on. Changes the wording, not the maths. */
  collecting: boolean;
  /** True the first time this month's earnings passed the free limit. */
  crossed: boolean;
  /** Human date fees begin, shown while collecting is false. */
  feesStart: string;
}) {
  const over = Math.max(0, qmeMinor - FREE_LIMIT_MINOR);

  return (
    <div className="month">
      <div className="month-line">
        <span className="fig fig-sm">{formatMinor(qmeMinor, currency)}</span>
        <span className="month-sep">earned</span>
        <span className="month-sep">&middot;</span>
        <span className="month-free">first {formatMinor(FREE_LIMIT_MINOR, currency)} free</span>
        {over > 0 && (
          <>
            <span className="month-sep">&middot;</span>
            <span className="fig fig-sm" data-fee="1">{formatMinor(feeMinor, currency)}</span>
            <span className="month-sep">{collecting ? "fee" : "fee from " + feesStart}</span>
          </>
        )}
      </div>

      {over === 0 && (
        <p className="tiny" style={{ marginTop: "var(--sp-2)", marginBottom: 0 }}>
          Nothing is charged under {formatMinor(FREE_LIMIT_MINOR, currency)} a month.
        </p>
      )}

      {!collecting && over > 0 && (
        <p className="tiny" style={{ marginTop: "var(--sp-2)", marginBottom: 0 }}>
          Nothing is being charged yet. This is what the fee will be once fees start
          on {feesStart}.
        </p>
      )}

      {crossed && (
        <div className="month-crossed">
          <strong>
            You&rsquo;ve passed {formatMinor(FREE_LIMIT_MINOR, currency)} this month.
          </strong>
          <p style={{ margin: "4px 0 0" }}>
            Weekly payout support and priority support are available for the rest of it. There is
            nothing to accept &mdash; they apply in any month you are over the line.
          </p>
        </div>
      )}
    </div>
  );
}
