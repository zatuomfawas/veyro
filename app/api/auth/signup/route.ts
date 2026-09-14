// Sign up. Validates on the server, because anything the browser checked can be
// bypassed by anyone who opens the network tab.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, audit } from "@/lib/auth";
import { evaluateDateOfBirth, MIN_SIGNUP_AGE } from "@/lib/age";

/** Founders may be 13+. A guardian must be a legal adult. */
const GUARDIAN_MIN_AGE = 18;

const cap = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Send valid JSON." }, { status: 400 }); }

  const email = cap(body.email, 254).toLowerCase();
  const password = String(body.password ?? "");
  const name = cap(body.name, 80);
  const role = body.role === "GUARDIAN" ? "GUARDIAN" : "FOUNDER";
  const country = cap(body.country, 2).toUpperCase();
  const region = cap(body.region, 60);

  // Age is gated on a full date of birth, honouring month and day. A bare year
  // cannot prove the 13+ floor, so it is rejected. See lib/age.ts.
  const dob = evaluateDateOfBirth({
    date: body.dateOfBirth ?? body.birthDate,
    year: body.birthYear,
    month: body.birthMonth,
    day: body.birthDay,
  });

  const errors: Record<string, string> = {};
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Enter a working email address.";
  // Length beats complexity rules. NIST stopped recommending forced symbols years ago.
  if (password.length < 10) errors.password = "Use at least 10 characters. A short sentence is fine.";
  if (name.length < 2) errors.name = "Enter the name your guardian will recognise.";
  if (!country) errors.country = "We need this to know which rules apply to you.";

  // A guardian is the adult who becomes the verified individual on the Stripe
  // account and accepts liability for it. The provider's floor of 13 is the
  // wrong test for them: a 14-year-old "guardian" would sail through signup and
  // only be caught later, by a failed identity check, after an account had been
  // opened and an invite accepted.
  if (role === "GUARDIAN" && dob.ok && dob.age < GUARDIAN_MIN_AGE) {
    errors.dateOfBirth =
      `A parent or guardian has to be at least ${GUARDIAN_MIN_AGE}. They are the adult named on `
      + "the payment account, and the payment provider verifies their identity.";
  }

  if (!dob.ok) {
    errors.dateOfBirth =
      dob.reason === "too_young"
        ? `You must be at least ${MIN_SIGNUP_AGE} to create an account. The payment provider sets this floor and it cannot be waived.`
        : dob.reason === "future"
          ? "That date is in the future. Enter your real date of birth."
          : dob.reason === "implausible"
            ? "Check the year — that date of birth doesn't look right."
            : "Enter your full date of birth as YYYY-MM-DD.";
  }

  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  // Every field is valid past this line; dob.ok is true.
  const dateOfBirth = dob.ok ? dob.date : null;
  const ageAtSignup = dob.ok ? dob.age : null;

  if (await db.user.findUnique({ where: { email } })) {
    // Deliberately vague. Confirming which addresses exist lets someone
    // enumerate your users.
    return NextResponse.json({ errors: { email: "That address cannot be used." } }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      email, name, countryCode: country, role,
      passwordHash: await hashPassword(password),
      dateOfBirth,
    },
  });

  await createSession(user.id);
  await audit(user.id, "account.created", email, undefined, { country, region, ageAtSignup });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
