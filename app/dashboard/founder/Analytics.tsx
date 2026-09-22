// The last thirty days, as four figures and a line about the best product.
//
// Everything is folded from rows at request time (see lib/analytics.ts). The
// job of this file is to not overstate what those rows support:
//
//   - Conversion is shown as "—" when there is nothing to divide, never 0%.
//     Zero percent is a claim that people looked and nobody bought; no data is
//     a different thing and reads differently.
//   - When view counting began after the window opened, the conversion cell
//     says which date it covers, because otherwise it silently compares thirty
//     days of sales against four days of views.
//   - Revenue is gross and labelled gross. Stripe takes its fee before the
//     money lands, so this is not what the founder keeps, and the wallet below
//     is the place that does the subtraction.
//   - Currencies are listed, never summed. There is no exchange rate here.

import { EmptyState } from "@/app/_ui/EmptyState";
import { formatMinor } from "@/lib/money";
import type { Analytics as Fold } from "@/lib/analytics";

const fmtDay = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// Grouped, so a thousand views reads as 1,000 rather than 1000. Money already
// goes through formatMinor; these are the only bare integers on the page and
// they were the only numbers without separators.
const fmtCount = (n: number) => n.toLocaleString("en-GB");

function Metric({
  value, label, sub, unknown,
}: {
  value: string;
  label: string;
  sub?: string;
  /** Dims the figure and keeps it from reading as a measurement. */
  unknown?: boolean;
}) {
  return (
    <div>
      <span className="m-n" data-unknown={unknown ? "1" : undefined}>{value}</span>
      <span className="m-l">{label}</span>
      {sub && <span className="m-s">{sub}</span>}
    </div>
  );
}

export function Analytics({ fold, hasProducts }: { fold: Fold; hasProducts: boolean }) {
  if (!fold.anyActivity) {
    return hasProducts ? (
      <EmptyState heading="Nothing to measure yet">
        Views and sales appear here once someone opens one of your checkout links. Counting starts
        the first time a link is opened.
      </EmptyState>
    ) : (
      <EmptyState heading="Nothing to measure yet">
        Figures appear here once you have a product for someone to open.
      </EmptyState>
    );
  }

  const conversion =
    fold.conversion === null
      ? null
      // One decimal below 10%, none above: 0.4% and 37% are both more readable
      // than the other's precision, and trailing zeros on a rate invented from
      // a handful of events suggest a confidence that is not there.
      : fold.conversion < 0.1
        ? `${(fold.conversion * 100).toFixed(1)}%`
        : `${Math.round(fold.conversion * 100)}%`;

  return (
    <>
      <div className="metrics">
        <Metric
          value={fmtCount(fold.views)}
          label="Checkout views"
          sub="One per browser session"
        />
        <Metric value={fmtCount(fold.purchases)} label="Purchases" />
        <Metric
          value={conversion ?? "—"}
          label="Conversion"
          unknown={conversion === null}
          sub={
            conversion === null
              ? "No views counted yet"
              : fold.conversionFrom
                ? `Since ${fmtDay(fold.conversionFrom)}, when counting began`
                : undefined
          }
        />
        {fold.revenue.length > 0 && (
          <Metric
            value={formatMinor(fold.revenue[0].grossMinor, fold.revenue[0].currency)}
            label="Taken, before fees"
            sub={
              fold.revenue.length > 1
                ? fold.revenue.slice(1)
                    .map((r) => formatMinor(r.grossMinor, r.currency))
                    .join(" · ") + " in other currencies"
                : undefined
            }
          />
        )}
      </div>

      {fold.topProduct && (
        <p className="small" style={{ margin: "20px 0 0" }}>
          Best seller: <strong>{fold.topProduct.name}</strong>,{" "}
          {fmtCount(fold.topProduct.purchases)}{" "}
          {fold.topProduct.purchases === 1 ? "sale" : "sales"} totalling{" "}
          <span className="num">
            {formatMinor(fold.topProduct.grossMinor, fold.topProduct.currency)}
          </span>
          .
        </p>
      )}

      <p className="tiny" style={{ margin: "12px 0 0" }}>
        Views are counted in the customer&rsquo;s browser and deduplicated per session, so someone
        opening the same link in two browsers counts twice. Amounts are gross, before Stripe&rsquo;s
        fee; the wallet is where that is taken off.
      </p>
    </>
  );
}
