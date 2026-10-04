import Link from "next/link";
import type { CurrencyFold } from "@/lib/ledger";
import { formatMinor } from "@/lib/money";

// The first thing on the page, and the reason anyone opens it.
//
// Three figures and one action. Available is the one that answers "how much
// can I take out", so it is the big one; net is what they actually kept after
// the processor; the count is how many payments made it up.
//
// It says "payments", not "customers". Nothing in this schema identifies a
// buyer -- a FounderTransaction has a product and an amount, not a person --
// so two payments from the same person are two rows. Calling that "customers"
// would be a number the product cannot stand behind.

export type DayPoint = { label: string; minor: number };

export function EarningsHero({
  fold, payments, series, otherFolds,
}: {
  fold: CurrencyFold;
  payments: number;
  series: DayPoint[];
  otherFolds: CurrencyFold[];
}) {
  const peak = Math.max(1, ...series.map((d) => d.minor));
  const weekTotal = series.reduce((n, d) => n + d.minor, 0);

  return (
    <div className="wallethero">
      <div className="eh-top">
        <div>
          <span className="wh-label">Available to request &middot; {fold.currency}</span>
          <span className="wh-big">{formatMinor(fold.available, fold.currency)}</span>
        </div>
        {fold.available > 0 && (
          <Link className="btn btn-lg" href="#payouts">Withdraw</Link>
        )}
      </div>

      <div className="eh-figs">
        <div>
          <span className="eh-n">{formatMinor(fold.net, fold.currency)}</span>
          <span className="eh-l">Net revenue, after fees</span>
        </div>
        <div>
          <span className="eh-n">{payments}</span>
          <span className="eh-l">{payments === 1 ? "Payment" : "Payments"} so far</span>
        </div>
        <div>
          <span className="eh-n">{formatMinor(weekTotal, fold.currency)}</span>
          <span className="eh-l">Last 7 days</span>
        </div>
      </div>

      {/* The week, as bars. Drawn from the same rows the figures come from, so
          a quiet week looks quiet rather than being hidden by a total. */}
      <div className="eh-chart" aria-hidden="true">
        {series.map((d, i) => (
          <span className="eh-col" key={d.label + i}>
            {/* The bar sits in its own track. Without one its percentage
                resolves against the whole column, label and gap included, so
                every value above about two thirds came out the same height and
                the chart stopped being a chart. */}
            <span className="eh-track">
              <span
                className="eh-bar"
                data-zero={d.minor === 0 ? "1" : undefined}
                style={{ height: `${Math.round((d.minor / peak) * 100)}%` }}
              />
            </span>
            <span className="eh-d">{d.label}</span>
          </span>
        ))}
      </div>
      <p className="sr-only">
        Earnings for the last seven days:{" "}
        {series.map((d) => `${d.label}, ${formatMinor(d.minor, fold.currency)}`).join("; ")}.
      </p>

      <details className="wh-more">
        <summary>Where that figure comes from</summary>
        <dl className="wh-break">
          <div><dt>Earned</dt><dd>{formatMinor(fold.earned, fold.currency)}</dd></div>
          <div><dt>Processing fees</dt><dd data-tone="out">&minus;{formatMinor(fold.fees, fold.currency)}</dd></div>
          <div><dt>Refunded</dt><dd data-tone="out">&minus;{formatMinor(fold.refunded, fold.currency)}</dd></div>
          <div><dt>Still settling</dt><dd>{formatMinor(fold.pending, fold.currency)}</dd></div>
          <div><dt>Paid out</dt><dd data-tone="settled">{formatMinor(fold.paidOut, fold.currency)}</dd></div>
        </dl>
      </details>

      {/* Never summed with the figure above: a minor-unit integer means nothing
          without its currency, and adding JPY to USD would be a lie with a
          decimal point in it. */}
      {otherFolds.length > 0 && (
        <p className="wh-sub" style={{ marginTop: "var(--sp-5)" }}>
          Also holding{" "}
          {otherFolds.map((f, i) => (
            <span key={f.currency}>
              {i > 0 ? ", " : ""}
              {formatMinor(f.available, f.currency)} available in {f.currency}
            </span>
          ))}
          . Each currency is kept on its own.
        </p>
      )}
    </div>
  );
}
