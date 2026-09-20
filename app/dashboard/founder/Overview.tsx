import Link from "next/link";
import type { CurrencyFold } from "@/lib/ledger";
import type { ConsentState } from "@/lib/consent";
import type { RequirementInfo } from "@/lib/stripe-account";
import { formatMinor } from "@/lib/money";
import { Icon } from "@/app/_ui/marks";
import { SUPPORT_EMAIL, fmtDate } from "@/app/_ui/dash";
import RevenueToggle from "./RevenueToggle";

// The top of the founder dashboard: revenue first, status second, action third.
//
// A founder opens this to answer two questions, "how much have I made" and
// "what do I do next", and everything above the fold now answers one of those.
// The working sections below it, products, transactions, payouts, activity, are
// untouched; this reorders the page rather than replacing it.

/* ---------------- status ---------------- */

export type Overall = "live" | "setup_incomplete" | "awaiting_guardian" | "restricted";

const BADGE: Record<Overall, { label: string; cls: string }> = {
  live: { label: "Live", cls: "b-pine" },
  setup_incomplete: { label: "Setup incomplete", cls: "b-amber" },
  awaiting_guardian: { label: "Awaiting guardian", cls: "b-slate" },
  restricted: { label: "Restricted", cls: "b-clay" },
};

export function overallStatus(state: ConsentState, accountStatus?: string): Overall {
  if (accountStatus === "ACTIVE") return "live";
  if (accountStatus === "RESTRICTED" || accountStatus === "DISCONNECTED") return "restricted";
  // Before an account exists the next move is the guardian's either way: they
  // consent, then they open it.
  if (state !== "consented") return "awaiting_guardian";
  if (!accountStatus || accountStatus === "NOT_STARTED" || accountStatus === "AWAITING_GUARDIAN") {
    return "awaiting_guardian";
  }
  return "setup_incomplete";
}

/* ---------------- header ---------------- */

export function BusinessHeader({
  name, country, status,
}: { name: string; country: string; status: Overall }) {
  return (
    <div className="page-h" style={{ marginBottom: "var(--sp-6)" }}>
      <div className="row-b" style={{ flexWrap: "wrap", gap: "var(--sp-4)" }}>
        <div>
          {/* The founder's own name. There is no Business model in this schema,
              and labelling a person's name "your business" is a small untruth a
              parent reading over their shoulder would notice. */}
          <h1 className="d2" style={{ fontSize: "var(--fs-8)", margin: 0 }}>{name}</h1>
          <p className="small" style={{ marginTop: 4, marginBottom: 0 }}>{country}</p>
        </div>
        <span className={"badge " + BADGE[status].cls}>{BADGE[status].label}</span>
      </div>
    </div>
  );
}

/* ---------------- revenue ---------------- */

/** One line of the revenue summary. Wraps rather than overflowing when narrow. */
function SummaryRow({
  label, value, strong,
}: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className="row-b"
      style={{
        padding: "9px 0",
        borderBottom: "1px solid var(--line-soft)",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: "var(--fs-3)" }}>{label}</span>
      <span
        className="num"
        style={{ fontSize: "var(--fs-3)", fontWeight: strong ? 560 : 400, whiteSpace: "nowrap" }}
      >
        {value}
      </span>
    </div>
  );
}

export function RevenueCard({
  fold, monthMinor, otherCurrencies, hasTransactions, firstLiveHref,
}: {
  fold: CurrencyFold | null;
  monthMinor: number;
  otherCurrencies: CurrencyFold[];
  hasTransactions: boolean;
  firstLiveHref: string | null;
}) {
  if (!fold || !hasTransactions) {
    return (
      <div className="card">
        <div className="card-b">
          <span
            className="num"
            style={{
              fontSize: "clamp(30px, 9vw, var(--fs-9))",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "-0.022em",
            }}
          >
            {formatMinor(0, fold?.currency ?? "USD")}
          </span>
          <p className="small" style={{ marginTop: "var(--sp-3)", marginBottom: 0 }}>
            No sales yet. Share your checkout link with customers.
          </p>
          {firstLiveHref && (
            <div className="row" style={{ marginTop: "var(--sp-4)", gap: 8, flexWrap: "wrap" }}>
              <Link className="btn btn-2 btn-sm" href={firstLiveHref}>See your checkout page</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-b">
        {/* Both figures are computed on the server, so the toggle switches
            between two known numbers rather than refetching. */}
        <RevenueToggle
          allTime={formatMinor(fold.earned, fold.currency)}
          thisMonth={formatMinor(monthMinor, fold.currency)}
        />

        {/* Two label/value lines, not a table. .tblwrap forces a 520px floor on
            the table inside it, which is right for the transactions grid and
            wrong here: it would make a two-row summary scroll sideways inside a
            phone-width card. These rows wrap instead. */}
        <div style={{ marginTop: "var(--sp-5)", borderTop: "1px solid var(--ink)" }}>
          <SummaryRow
            label="Still settling"
            value={formatMinor(fold.pending, fold.currency)}
          />
          <SummaryRow
            label="Available to request"
            value={formatMinor(fold.available, fold.currency)}
            strong
          />
        </div>

        {fold.available > 0 && (
          <div className="row" style={{ marginTop: "var(--sp-4)", gap: 8, flexWrap: "wrap" }}>
            <Link className="btn btn-2 btn-sm" href="#payouts">Request a payout</Link>
          </div>
        )}

        {/* Deliberately listed, never added together. Summing currencies needs
            an exchange rate this app does not have, and a made-up total is
            worse than two honest ones. */}
        {otherCurrencies.length > 0 && (
          <p className="tiny" style={{ marginTop: "var(--sp-4)", marginBottom: 0 }}>
            Also{" "}
            {otherCurrencies.map((c, i) => (
              <span key={c.currency}>
                {i > 0 ? ", " : ""}
                {formatMinor(c.earned, c.currency)} in {c.currency}
              </span>
            ))}
            . Currencies are kept apart rather than converted.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- compact indicators ---------------- */

function Indicator({
  icon, tone, head, children,
}: { icon: string; tone: "pine" | "amber" | "slate" | "clay" | "grey"; head: React.ReactNode; children?: React.ReactNode }) {
  const colour =
    tone === "pine" ? "var(--pine)" : tone === "amber" ? "var(--amber)"
      : tone === "clay" ? "var(--clay)" : tone === "slate" ? "var(--slate)" : "var(--ink-3)";
  return (
    <div className="reqrow">
      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
        <span style={{ color: colour, display: "inline-flex", marginTop: 2 }}>
          <Icon name={icon} size={13} />
        </span>
        <span>
          <span className="req-t">{head}</span>
          {children && <span className="req-d">{children}</span>}
        </span>
      </div>
    </div>
  );
}

export function GuardianStatus({
  state, guardianName, invitedEmail, consentedAt, expiresAt,
}: {
  state: ConsentState;
  guardianName: string;
  invitedEmail?: string;
  consentedAt?: Date | null;
  expiresAt?: Date | null;
}) {
  if (state === "consented") {
    return (
      <Indicator icon="check" tone="pine" head={`${guardianName} approved`}>
        {consentedAt ? fmtDate(consentedAt) : null}
      </Indicator>
    );
  }
  if (state === "pending") {
    return (
      <Indicator icon="person" tone="amber" head={`Invite sent to ${invitedEmail}`}>
        {expiresAt ? `Expires ${fmtDate(expiresAt)}` : null}
      </Indicator>
    );
  }
  if (state === "declined") {
    return <Indicator icon="person" tone="clay" head={`${guardianName} declined`} />;
  }
  if (state === "expired") {
    return (
      <Indicator icon="person" tone="grey"
        head={expiresAt ? `Invite expired ${fmtDate(expiresAt)}` : "Invite expired"} />
    );
  }
  return <Indicator icon="person" tone="grey" head="No guardian" />;
}

export function PaymentStatus({
  accountStatus, requirements, guardianName, connectedAt,
}: {
  accountStatus?: string;
  requirements: RequirementInfo[];
  guardianName: string;
  connectedAt?: Date | null;
}) {
  if (accountStatus === "ACTIVE") {
    return (
      <Indicator icon="check" tone="pine" head="Live on Stripe">
        {connectedAt ? `Since ${fmtDate(connectedAt)}` : null}
      </Indicator>
    );
  }

  if (accountStatus === "REQUIREMENTS_DUE") {
    const top = requirements.slice(0, 3);
    const rest = requirements.length - top.length;
    return (
      <Indicator icon="card" tone="amber"
        head={`${guardianName} needs to complete ${requirements.length} ${requirements.length === 1 ? "thing" : "things"}`}>
        {top.map((r) => r.label).join(", ")}
        {rest > 0 ? `, and ${rest} more` : ""}
      </Indicator>
    );
  }

  if (accountStatus === "PENDING") {
    return <Indicator icon="card" tone="slate" head="Setting up" >Stripe is reviewing it.</Indicator>;
  }

  if (accountStatus === "RESTRICTED" || accountStatus === "DISCONNECTED") {
    return (
      <Indicator icon="card" tone="clay"
        head={accountStatus === "RESTRICTED" ? "On hold" : "Needs reconnection"}>
        <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </Indicator>
    );
  }

  return (
    <Indicator icon="card" tone="grey" head="Payments not set up">
      {guardianName === "Your guardian" ? "Your guardian will set this up." : `${guardianName} will set this up.`}
    </Indicator>
  );
}

/* ---------------- one action ---------------- */

export function PrimaryAction({
  state, accountStatus,
}: { state: ConsentState; accountStatus?: string }) {
  // Deliberately renders nothing in the two states where the next move belongs
  // to the guardian. A button a founder cannot act on is worse than none: it
  // implies they are the blocker when they are not.
  if (accountStatus === "RESTRICTED" || accountStatus === "DISCONNECTED") {
    return (
      <a className="btn btn-w" href={`mailto:${SUPPORT_EMAIL}`}>Get help</a>
    );
  }
  if (accountStatus === "ACTIVE") {
    return <Link className="btn btn-w" href="#products">Create product</Link>;
  }
  if (state === "none") {
    return <Link className="btn btn-w" href="#guardian">Invite guardian</Link>;
  }
  if (state === "declined" || state === "expired") {
    return <Link className="btn btn-w" href="#guardian">Send a new invite</Link>;
  }
  return null;
}
