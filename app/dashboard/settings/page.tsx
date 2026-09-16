// Account settings.
//
// Three things can change here and one deliberately cannot. Email is absent
// because nothing in this app can send mail — invites are copied by hand for
// the same reason — and an email change that cannot be verified is account
// takeover waiting to happen: point the address at one you control, then
// recover the password. Saying that on the page is better than shipping a field
// that quietly does the wrong thing.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buildViewport } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

import { CSS, CSS2 } from "@/app/_ui/css";
import { Notice } from "@/app/_ui/form";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";
import { DashNav, DashHeader, Section, SUPPORT_EMAIL, fmtDate, type DashRole } from "@/app/_ui/dash";

import { ProfileForm, PasswordForm } from "./SettingsForms";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Settings | Veyro",
  robots: { index: false, follow: false },
};

const COUNTRY_NAME = new Map(SIGNUP_COUNTRIES);

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  // Country is locked once a connected account exists, because that account was
  // opened in a specific jurisdiction and its requirements, currency and payout
  // rails all follow from it. Guardians have no payment account of their own —
  // the account belongs to the founder — so theirs is never locked here.
  const account =
    user.role === "FOUNDER"
      ? await db.founderPaymentAccount.findUnique({ where: { founderId: user.id } })
      : null;

  const countryLocked = Boolean(account);
  const lockedCountryName = COUNTRY_NAME.get(user.countryCode) ?? user.countryCode;

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <DashNav role={user.role as DashRole} current="settings" />

      <main id="main" className="wrap-w" style={{ paddingTop: 24, paddingBottom: 80 }}>
        <DashHeader
          title="Settings"
          subtitle={
            <>
              <span className="mono">{user.email}</span> &middot;{" "}
              {user.role === "FOUNDER" ? "Founder" : user.role === "GUARDIAN" ? "Guardian" : "Admin"}{" "}
              account since {fmtDate(user.createdAt)}
            </>
          }
        />

        <div className="grid-2" style={{ gap: 32, alignItems: "start" }}>
          <div>
            <Section title="Your details">
              <ProfileForm
                initialName={user.name}
                initialCountry={user.countryCode}
                countryLocked={countryLocked}
                lockedReason={
                  `Your payment account is already open in ${lockedCountryName}. Stripe verified `
                  + "an identity and set up payouts against that country, so changing it here "
                  + "would leave Veyro describing one place and Stripe operating in another. "
                  + "Moving country means closing that account and opening a new one. Email us "
                  + "and we will talk you through it."
                }
              />
            </Section>

            <Section title="Email address">
              <p className="body" style={{ marginTop: 0 }}>
                Your email is <span className="mono">{user.email}</span>, and it cannot be changed
                here yet.
              </p>
              <Notice tone="grey" head="Why not">
                <p style={{ margin: "0 0 8px" }}>
                  Changing an email address is only safe if the new one is proved to belong to you
                  first. Veyro cannot send mail yet, which is also why guardian invitations are
                  copied by hand rather than emailed, so there is no way to prove it.
                </p>
                <p style={{ margin: 0 }}>
                  An unverified change would be the easiest way to take over an account: point the
                  address somewhere else, then reset the password. We would rather leave the field
                  out and say so. Email{" "}
                  <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> if you
                  need it changed.
                </p>
              </Notice>
            </Section>
          </div>

          <div>
            <Section title="Password">
              <p className="small" style={{ marginTop: 0 }}>
                Changing your password signs out every other device. This one stays signed in.
              </p>
              <PasswordForm />
            </Section>

            <Section title="Your account">
              <div className="reqlist">
                <div className="reqrow">
                  <div>
                    <span className="req-t">Role</span>
                    <span className="req-d">
                      {user.role === "FOUNDER"
                        ? "You run a business. A guardian is the adult on your payment account."
                        : user.role === "GUARDIAN"
                          ? "You are the adult the payment provider verifies for a founder."
                          : "Administrator."}
                    </span>
                  </div>
                </div>
                <div className="reqrow">
                  <div>
                    <span className="req-t">Joined</span>
                    <span className="req-d">{fmtDate(user.createdAt)}</span>
                  </div>
                </div>
                {user.role === "FOUNDER" && (
                  <div className="reqrow">
                    <div>
                      <span className="req-t">Payment account</span>
                      <span className="req-d">
                        {account
                          ? `Open in ${lockedCountryName}, status ${account.status.toLowerCase().replace(/_/g, " ")}.`
                          : "Not opened yet. Your guardian opens it."}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <p className="tiny" style={{ marginTop: 16, marginBottom: 0 }}>
                Need to close your account or change something not listed here? Email{" "}
                <a className="linkbtn" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>
            </Section>
          </div>
        </div>

        <p className="tiny" style={{ marginTop: 8 }}>
          <Link className="linkbtn" href="/how-it-works">How Veyro works</Link>
        </p>
      </main>
    </div>
  );
}
