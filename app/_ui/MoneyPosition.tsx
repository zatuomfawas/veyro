import type { CurrencyFold } from "@/lib/ledger";
import { formatMinor } from "@/lib/money";

// The money position: what came in, what was taken out, and exactly where the
// rest of it is.
//
// This is the one view that has to be arithmetically honest, so every figure
// here comes from a fold of the founder's own transaction rows. Nothing is
// assigned, estimated, or rounded to look tidy. The fee in particular is read
// from Stripe's balance transaction rather than calculated from a published
// percentage, because a published percentage is wrong the moment a card is
// international or an account has negotiated rates.
//
// Two things it deliberately does NOT do:
//
//   It does not subtract fees from `available`. Stripe deducts its fee before
//   the money reaches the connected account, so the fee was never in a balance
//   Veyro could pay out. Net income and withdrawable balance are different
//   questions and conflating them is how a founder ends up expecting money
//   that was never there.
//
//   It does not show a fee total as final while any completed payment is still
//   missing one. Some payment methods settle their balance transaction after
//   the payment succeeds. Until every fee is known the figure is a floor, and
//   the component says so rather than presenting an incomplete sum as complete.

/** A single line of the reconciliation, with its sign made explicit. */
function Line({
  label, amount, currency, sign, strong, note,
}: {
  label: string;
  amount: number;
  currency: string;
  sign?: "+" | "-";
  strong?: boolean;
  note?: string;
}) {
  return (
    <div
      className="row-b"
      style={{ padding: "8px 0", borderBottom: "1px solid var(--line-soft)", gap: 16 }}
    >
      <span style={{ fontSize: "var(--fs-3)", fontWeight: strong ? 560 : 400 }}>
        {label}
        {note && <span className="tiny" style={{ display: "block", marginTop: 4 }}>{note}</span>}
      </span>
      <span
        className="num"
        style={{
          fontSize: strong ? "var(--fs-5)" : "var(--fs-3)",
          fontWeight: strong ? 600 : 400,
          whiteSpace: "nowrap",
        }}
      >
        {sign === "-" ? "− " : sign === "+" ? "+ " : ""}
        {formatMinor(amount, currency)}
      </span>
    </div>
  );
}

/**
 * The band. Widths are proportions of the total, so the bar always sums to the
 * whole and cannot imply money that is not there.
 */
function Band({ fold }: { fold: CurrencyFold }) {
  const parts = [
    { key: "paidOut", label: "Paid out", value: Math.max(0, fold.paidOut), cls: "b-slate" },
    { key: "available", label: "Available", value: Math.max(0, fold.available), cls: "b-pine" },
    { key: "reserved", label: "Committed", value: Math.max(0, fold.reserved), cls: "b-grey" },
    { key: "pending", label: "Still settling", value: Math.max(0, fold.pending), cls: "b-amber" },
  ].filter((p) => p.value > 0);

  const total = parts.reduce((t, p) => t + p.value, 0);
  if (total === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{ display: "flex", height: 10, border: "1px solid var(--ink)", overflow: "hidden" }}
        role="img"
        aria-label={parts.map((p) => `${p.label} ${formatMinor(p.value, fold.currency)}`).join(", ")}
      >
        {parts.map((p, i) => (
          <span
            key={p.key}
            style={{
              width: `${(p.value / total) * 100}%`,
              background:
                p.key === "available" ? "var(--pine)"
                  : p.key === "paidOut" ? "var(--slate)"
                    : p.key === "pending" ? "var(--amber)"
                      : "var(--ink-3)",
              borderLeft: i === 0 ? "none" : "1px solid var(--ink)",
            }}
          />
        ))}
      </div>

      <div className="row" style={{ marginTop: 12, gap: 20, flexWrap: "wrap" }}>
        {parts.map((p) => (
          <span key={p.key} style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
            <span className={"badge " + p.cls}>{p.label}</span>
            <span className="num" style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>
              {formatMinor(p.value, fold.currency)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function MoneyPosition({
  fold, example = false,
}: {
  fold: CurrencyFold;
  /** True when the figures are illustrative rather than this account's. */
  example?: boolean;
}) {
  const feesKnown = fold.feesPending === 0;

  return (
    <div className="card">
      <div className="card-h">
        <span style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>
          Money position &middot; {fold.currency}
        </span>
        {example ? <span className="badge b-grey">Example data</span> : null}
      </div>

      <div className="card-b">
        <div>
          <span
            className="num"
            style={{ fontSize: "var(--fs-8)", fontWeight: "var(--fw-bold)", letterSpacing: "-0.022em" }}
          >
            {formatMinor(fold.net, fold.currency)}
          </span>
          <span className="tiny" style={{ display: "block", marginTop: 4 }}>
            net revenue{feesKnown ? "" : ", so far"}
          </span>
        </div>

        {/* The arithmetic, stated. */}
        <div style={{ marginTop: 20, borderTop: "1px solid var(--ink)" }}>
          <Line label="Collected" amount={fold.earned} currency={fold.currency} sign="+" />
          <Line
            label="Stripe fees"
            amount={fold.fees}
            currency={fold.currency}
            sign="-"
            note={
              feesKnown
                ? undefined
                : `${fold.feesPending} payment${fold.feesPending === 1 ? "" : "s"} still awaiting a fee from Stripe, so this is a floor.`
            }
          />
          <Line label="Refunded" amount={fold.refunded} currency={fold.currency} sign="-" />
          <Line label="Net revenue" amount={fold.net} currency={fold.currency} strong />
        </div>

        <Band fold={fold} />

        <p className="tiny" style={{ marginTop: 16, marginBottom: 0 }}>
          Stripe deducts its fee before the money reaches your account, so it was never part of a
          balance you could withdraw. Net revenue is what you keep; available is what you can
          request today.
        </p>
      </div>
    </div>
  );
}
