"use client";

// The wallet's four views, as the product arranges them.
//
// The point is to show the shape of Founder Wallet — that money, payments,
// payouts and products are four faces of one ledger — without pretending the
// homepage is logged in. Every panel is illustrative and says so.
//
// Overview renders MoneyPosition, the real component from the dashboard, fed
// fixed figures. The other three are short, honest tables built from the same
// classes. None of them fabricates a capability: payouts shows the request
// states the schema actually has, products shows the statuses a product can
// actually be in.
//
// Tabs, not accordions, because these are alternative views of one thing rather
// than a list to read through. Implemented as a real tablist so arrow keys work.

import { useCallback, useRef, useState } from "react";
import { MoneyPosition } from "@/app/_ui/MoneyPosition";
import { formatMinor } from "@/lib/money";
import type { CurrencyFold } from "@/lib/ledger";

const FOLD: CurrencyFold = {
  currency: "USD",
  earned: 30000,
  refunded: 4500,
  fees: 1050,
  feesPending: 0,
  net: 24450,
  pending: 1500,
  reserved: 0,
  paidOut: 6000,
  available: 19500,
};

const TABS = ["Overview", "Transactions", "Payouts", "Products"] as const;
type Tab = (typeof TABS)[number];

const TX: { when: string; what: string; amount: number; state: string; badge: string }[] = [
  { when: "Today, 16:04", what: "Notion Second Brain", amount: 2500, state: "Available", badge: "b-pine" },
  { when: "Today, 11:27", what: "Sticker pack", amount: 1200, state: "Available", badge: "b-pine" },
  { when: "Yesterday", what: "Commission slot", amount: 4500, state: "Still settling", badge: "b-amber" },
  { when: "2 Sept", what: "Notion Second Brain", amount: -2500, state: "Refunded", badge: "b-clay" },
];

const PAYOUTS: { when: string; amount: number; state: string; badge: string }[] = [
  { when: "1 Sept", amount: 6000, state: "Paid out", badge: "b-pine" },
  { when: "28 Aug", amount: 4000, state: "Paid out", badge: "b-pine" },
];

const PRODUCTS: { name: string; price: number; state: string; badge: string }[] = [
  { name: "Notion Second Brain", price: 2500, state: "Live", badge: "b-pine" },
  { name: "Sticker pack", price: 1200, state: "Live", badge: "b-pine" },
  { name: "Commission slot", price: 4500, state: "Live", badge: "b-pine" },
  { name: "Print run", price: 1800, state: "Draft", badge: "b-amber" },
];

export function WalletTabs() {
  const [tab, setTab] = useState<Tab>("Overview");
  const strip = useRef<HTMLDivElement>(null);

  // Left and right move between tabs, which is what a tablist is expected to
  // do; without it the arrow keys do nothing and the widget is a row of
  // buttons wearing a tablist's roles.
  const onKey = useCallback((e: React.KeyboardEvent) => {
    const i = TABS.indexOf(tab);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const t = TABS[(next + TABS.length) % TABS.length];
    setTab(t);
    strip.current?.querySelector<HTMLButtonElement>(`[data-tab="${t}"]`)?.focus();
  }, [tab]);

  return (
    <div>
      <div className="seg segwrap" role="tablist" aria-label="Founder Wallet" ref={strip} onKeyDown={onKey}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            data-tab={t}
            id={`wt-${t}`}
            // aria-selected, not aria-pressed: a tab is selected, not pressed,
            // and pairing the two tells a screen reader the control is both.
            aria-selected={tab === t}
            aria-controls={`wp-${t}`}
            tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div id={`wp-${tab}`} role="tabpanel" aria-labelledby={`wt-${tab}`} tabIndex={0} style={{ marginTop: 14 }}>
        {tab === "Overview" && <MoneyPosition fold={FOLD} example />}

        {tab === "Transactions" && (
          <div className="card">
            <div className="card-h">
              <span style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>Payments</span>
              <span className="badge b-grey">Example data</span>
            </div>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th scope="col">When</th>
                    <th scope="col">Product</th>
                    <th scope="col">Amount</th>
                    <th scope="col">State</th>
                  </tr>
                </thead>
                <tbody>
                  {TX.map((t) => (
                    <tr key={t.when + t.what}>
                      <td className="tiny">{t.when}</td>
                      <td>{t.what}</td>
                      <td className="num">{formatMinor(t.amount, "USD")}</td>
                      <td><span className={"badge " + t.badge}>{t.state}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "Payouts" && (
          <div className="card">
            <div className="card-h">
              <span style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>Payouts</span>
              <span className="badge b-grey">Example data</span>
            </div>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th scope="col">Requested</th>
                    <th scope="col">Amount</th>
                    <th scope="col">State</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYOUTS.map((p) => (
                    <tr key={p.when}>
                      <td className="tiny">{p.when}</td>
                      <td className="num">{formatMinor(p.amount, "USD")}</td>
                      <td><span className={"badge " + p.badge}>{p.state}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-f">
              <p className="tiny" style={{ margin: 0 }}>
                You ask; your guardian is notified; Stripe pays out to the bank account on the
                payment account, on its own schedule.
              </p>
            </div>
          </div>
        )}

        {tab === "Products" && (
          <div className="card">
            <div className="card-h">
              <span style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>Products</span>
              <span className="badge b-grey">Example data</span>
            </div>
            <div className="tblwrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Price</th>
                    <th scope="col">State</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((p) => (
                    <tr key={p.name}>
                      <td>{p.name}</td>
                      <td className="num">{formatMinor(p.price, "USD")}</td>
                      <td><span className={"badge " + p.badge}>{p.state}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-f">
              <p className="tiny" style={{ margin: 0 }}>
                A draft has no working link. Making it live is what gives you one.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
