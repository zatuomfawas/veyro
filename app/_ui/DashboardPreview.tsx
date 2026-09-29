// The homepage's emotional payoff: what your dashboard looks like once it is
// working. This is the thing someone is meant to want.
//
// The figures are examples and say so. They are also internally consistent,
// because a preview whose arithmetic does not add up is the first thing a
// sceptical parent notices:
//
//   gross            264.00
//   Stripe fees      -19.50
//   net              244.50   <- shown
//   already paid out -49.50
//   available        195.00   <- shown
//
// and the fourteen customers across those prices average $18.86, which is a
// sticker pack and a commission, not a fantasy.

import { CountUp } from "@/app/_ui/CountUp";

const DAYS = [
  { d: "M", v: 18 }, { d: "T", v: 34 }, { d: "W", v: 12 }, { d: "T", v: 45 },
  { d: "F", v: 62 }, { d: "S", v: 41 }, { d: "S", v: 52 },
];
const PEAK = Math.max(...DAYS.map((x) => x.v));

const ROWS: { name: string; gross: string; fee: string; net: string; state: "paid" | "settling" }[] = [
  { name: "Commission slot", gross: "$45.00", fee: "$1.61", net: "$43.39", state: "paid" },
  { name: "Sticker pack",    gross: "$12.00", fee: "$0.65", net: "$11.35", state: "paid" },
  { name: "Print run",       gross: "$18.00", fee: "$0.82", net: "$17.18", state: "settling" },
];

export function DashboardPreview() {
  return (
    <div className="dp" role="img"
      aria-label="Example founder dashboard showing $244.50 net revenue, $195.00 available to request, and 14 customers">
      {/* Window chrome. It reads as an application rather than as a diagram
          of one, which is the whole difference between "here is how it works"
          and "this is yours". */}
      <div className="dp-bar" aria-hidden="true">
        <span className="dp-dots"><i /><i /><i /></span>
        <span className="dp-title">Your dashboard</span>
        <span className="dp-tag">Example</span>
      </div>

      <div className="dp-body" aria-hidden="true">
        <div className="dp-head">
          <div>
            <span className="dp-k">Available to request</span>
            <span className="dp-big">
              {/* The one number on the site that moves. It renders as the
                  final value on the server, so with no JavaScript or with
                  reduced motion the correct figure is already there. */}
              <CountUp amountMinor={19500} currency="USD" />
            </span>
          </div>
          <span className="dp-cta">Request a payout</span>
        </div>

        <div className="dp-stats">
          <div>
            <span className="dp-n">$244.50</span>
            <span className="dp-l">Net revenue</span>
          </div>
          <div>
            <span className="dp-n">14</span>
            <span className="dp-l">Customers</span>
          </div>
          <div>
            <span className="dp-n dp-up">+38%</span>
            <span className="dp-l">vs last week</span>
          </div>
        </div>

        <div className="dp-chart">
          <div className="dp-chart-h">
            <span className="dp-k">This week</span>
            <span className="dp-k">$264.00 gross</span>
          </div>
          <div className="dp-bars">
            {DAYS.map((x, i) => (
              <span key={i} className="dp-bar-col">
                <span className="dp-bar-v" style={{ height: `${Math.round((x.v / PEAK) * 100)}%` }} />
                <span className="dp-bar-d">{x.d}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="dp-tx">
          {ROWS.map((r) => (
            <div className="dp-row" key={r.name}>
              <span className="dp-row-n">{r.name}</span>
              <span className="dp-row-m">
                {r.gross} <span className="dp-row-f">&minus; {r.fee} fee</span>
              </span>
              <span className="dp-row-net">{r.net}</span>
              <span className={`dp-pill dp-${r.state}`}>
                {r.state === "paid" ? "Paid" : "Settling"}
              </span>
            </div>
          ))}
        </div>

        <div className="dp-foot">
          <span className="dp-dot" /> $49.50 paid out to your bank on 20 Sept
        </div>
      </div>
    </div>
  );
}
