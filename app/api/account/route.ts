// Changing the things about an account that can safely change.
//
// PATCH { name?, countryCode? }
//
// Country is refused once a FounderPaymentAccount exists. The Stripe connected
// account was opened in a specific country, and its requirements, currency and
// payout rails follow from that; editing the field here would leave Veyro
// claiming one jurisdiction while Stripe operates in another. Enforced on the
// server, because a disabled input is a suggestion.
//
// Email is deliberately absent. Nothing in this app can send mail — invites are
// copied by hand for the same reason — so an email change could not be
// verified, and an unverified change is account takeover waiting to happen: set
// the address to one you control, then recover the password. The settings page
// says this plainly rather than offering a field that quietly does the wrong
// thing.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser, audit } from "@/lib/auth";
import { readJson, cap } from "../founder/_scope";
import { SIGNUP_COUNTRIES } from "@/app/_ui/countries";

export const runtime = "nodejs";

const KNOWN_COUNTRIES = new Set(SIGNUP_COUNTRIES.map(([code]) => code));

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = await readJson(req);
  if (body instanceof NextResponse) return body;

  const errors: Record<string, string> = {};
  const data: { name?: string; countryCode?: string } = {};

  if (body.name !== undefined) {
    const name = cap(body.name, 80);
    if (name.length < 2) errors.name = "Enter the name your guardian will recognise.";
    else data.name = name;
  }

  if (body.countryCode !== undefined) {
    const countryCode = cap(body.countryCode, 2).toUpperCase();
    if (!KNOWN_COUNTRIES.has(countryCode)) {
      errors.countryCode = "Choose a country from the list.";
    } else if (countryCode !== user.countryCode) {
      const account = await db.founderPaymentAccount.findUnique({ where: { founderId: user.id } });
      if (account) {
        errors.countryCode =
          `Your payment account is already open in ${user.countryCode}, so this cannot be changed `
          + "here. Moving country means closing that account and opening a new one.";
      } else {
        data.countryCode = countryCode;
      }
    }
  }

  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
  }

  const updated = await db.user.update({ where: { id: user.id }, data });
  await audit(user.id, "account.updated", user.id, undefined, { fields: Object.keys(data) });

  return NextResponse.json({
    ok: true,
    user: {
      id: updated.id, name: updated.name, email: updated.email, countryCode: updated.countryCode,
    },
  });
}
