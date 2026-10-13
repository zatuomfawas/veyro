import Link from "next/link";
import type { CurrencyFold } from "@/lib/ledger";
import { formatMinor } from "@/lib/money";

export type DayPoint = { label: string; minor: number };

/** Render account values exactly as returned by the ledger, without counting motion. */
export function EarningsHero({
  fold, otherFolds, checkoutHref,
}: {
  fold: CurrencyFold | null;
  otherFolds: CurrencyFold[];
  checkoutHref: string | null;
}) {
  const currency = fold?.currency ?? "USD";
  const available = fold?.available ?? 0;

  return (
    <section className="account-balance" aria-labelledby="balance-heading">
      <div className="balance-heading">
        <h2 id="balance-heading">Available to request</h2>
        <span className="balance-currency">{currency}</span>
      </div>
      <p className="balance-amount num" data-tone="pine">{formatMinor(available, currency)}</p>
      <p className="balance-context">
        {fold
          ? "Calculated from your Veyro payment and payout records. Stripe handles the transfer to your bank."
          : "No payment records yet. Your first customer payment will appear here."}
      </p>
      <dl className="money-states">
        <div className="money-state" data-tone="amber">
          <dt>Still settling</dt>
          <dd><span className="num">{formatMinor(fold?.pending ?? 0, currency)}</span><span className="money-state-note">Not available to request</span></dd>
        </div>
        <div className="money-state" data-tone="slate">
          <dt>Reserved for requests</dt>
          <dd><span className="num">{formatMinor(fold?.reserved ?? 0, currency)}</span><span className="money-state-note">Requested or approved</span></dd>
        </div>
        <div className="money-state" data-tone="pine">
          <dt>Paid out</dt>
          <dd><span className="num">{formatMinor(fold?.paidOut ?? 0, currency)}</span><span className="money-state-note">Recorded as sent</span></dd>
        </div>
      </dl>
      <div className="balance-footer">
        {available > 0 ? (
          <Link className="btn" href="#payouts">Request payout</Link>
        ) : checkoutHref ? (
          <Link className="btn btn-2" href={checkoutHref} target="_blank" rel="noreferrer">Open your checkout</Link>
        ) : (
          <Link className="linkbtn" href="#account-setup">View account setup</Link>
        )}
        <Link className="linkbtn" href="#revenue-details">View revenue &amp; fees</Link>
      </div>
      {otherFolds.length > 0 && (
        <div className="balance-currencies">
          <p>Other currencies &middot; kept separately</p>
          <dl>
            {otherFolds.map((f) => (
              <div key={f.currency}>
                <dt>{f.currency} available to request</dt>
                <dd className="num">{formatMinor(f.available, f.currency)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

/** Revenue and costs are separate from available funds; this is not a balance equation. */
export function RevenueDetails({
  folds, payments, series,
}: { folds: CurrencyFold[]; payments: number; series: DayPoint[] }) {
  const weekTotal = series.reduce((total, d) => total + d.minor, 0);
  const peak = Math.max(1, ...series.map((d) => d.minor));
  return (
    <div className="revenue-details">
      <p className="small">{payments.toLocaleString("en-GB")} completed {payments === 1 ? "payment" : "payments"}. Totals below are kept separately by currency.</p>
      {folds.length === 0 ? (
        <p className="body">Revenue, refunds and Stripe processing fees appear after your first payment.</p>
      ) : folds.map((fold) => (
        <section className="revenue-currency" key={fold.currency} aria-label={`Revenue in ${fold.currency}`}>
          <h3 className="h4">{fold.currency} payment record</h3>
          <dl className="revenue-breakdown">
            <div><dt>Total collected, before fees and refunds</dt><dd className="num">{formatMinor(fold.earned, fold.currency)}</dd></div>
            <div><dt>Refunded</dt><dd className="num" data-tone="clay">{formatMinor(fold.refunded, fold.currency)}</dd></div>
            <div><dt>Stripe processing fees{fold.feesPending > 0 ? " reported so far" : ""}</dt><dd className="num">{formatMinor(fold.fees, fold.currency)}</dd></div>
            <div><dt>Net revenue after fees and refunds</dt><dd className="num">{formatMinor(fold.net, fold.currency)}</dd></div>
          </dl>
          {fold.feesPending > 0 && (
            <p className="small">Stripe has not reported the fee for {fold.feesPending} {fold.feesPending === 1 ? "payment" : "payments"} yet. Processing fees and net revenue are not final.</p>
          )}
        </section>
      ))}
      {folds.length === 1 && weekTotal > 0 && (
        <section className="revenue-week" aria-label="Collected over the last seven days">
          <div className="row-b"><h3 className="h4">Last 7 days</h3><span className="num">{formatMinor(weekTotal, folds[0].currency)} collected</span></div>
          <p className="small">Completed payments, before fees and refunds.</p>
          <div className="eh-chart" aria-hidden="true">
            {series.map((d, i) => (
              <span className="eh-col" key={d.label + i}>
                <span className="eh-track"><span className="eh-bar" data-zero={d.minor === 0 ? "1" : undefined} style={{ height: `${Math.round(d.minor / peak * 100)}%` }} /></span>
                <span className="eh-d">{d.label}</span>
              </span>
            ))}
          </div>
          <p className="sr-only">Oldest to newest: {series.map((d) => `${d.label}, ${formatMinor(d.minor, folds[0].currency)}`).join("; ")}.</p>
        </section>
      )}
      {folds.length > 1 && <p className="small">Weekly amounts are not combined across currencies. Each payment record keeps its own currency.</p>}
    </div>
  );
}
