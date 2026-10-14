import { formatMinor } from "@/lib/money";
import { FREE_LIMIT_MINOR } from "@/lib/fees";

/** The authoritative monthly ledger is in USD, separate from per-currency wallet records. */
export function ThisMonth({
  qmeMinor, feeMinor, currency, collecting, crossed,
}: {
  qmeMinor: number;
  feeMinor: number;
  currency: string;
  collecting: boolean;
  crossed: boolean;
}) {
  const over = Math.max(0, qmeMinor - FREE_LIMIT_MINOR);
  return (
    <section className="month dashboard-month" aria-labelledby="month-heading">
      <h3 id="month-heading" className="h4">This month &middot; {currency}</h3>
      <dl className="month-totals">
        <div><dt>Qualifying earnings</dt><dd className="num">{formatMinor(qmeMinor, currency)}</dd></div>
        <div><dt>Free allowance</dt><dd className="num">{formatMinor(FREE_LIMIT_MINOR, currency)}</dd></div>
        <div><dt>{collecting ? "Veyro fee" : "Estimated Veyro fee"}</dt><dd className="num">{formatMinor(feeMinor, currency)}</dd></div>
      </dl>
      <p className="small">
        {!collecting
          ? "Veyro fee collection is postponed. This is an estimate at the planned rate, not a charge. A new start date will be announced."
          : over === 0
            ? `Nothing is charged under ${formatMinor(FREE_LIMIT_MINOR, currency)} a month.`
            : "The fee applies only to qualifying earnings above the free allowance."}
        {" "}This monthly ledger is recorded in USD; wallet currencies remain separate.
      </p>
      {crossed && (
        <div className="month-crossed">
          <strong>You&rsquo;ve passed {formatMinor(FREE_LIMIT_MINOR, currency)} this month.</strong>
          <p>Weekly payout support and priority support are available for the rest of it. There is nothing to accept &mdash; they apply in any month you are over the line.</p>
        </div>
      )}
    </section>
  );
}
