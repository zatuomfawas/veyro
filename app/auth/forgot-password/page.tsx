import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport } from "@/lib/seo";
import { AuthShell } from "@/app/_ui/AuthShell";
import ForgotForm from "./ForgotForm";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Reset your password | Veyro",
  robots: { index: false, follow: false },
};

export default function ForgotPassword() {
  return (
    <AuthShell
      title="Reset your password"
      lead="We will email you a link to set a new one. It works for one hour and can be used once."
      footer={
        <>
          Remembered it? <Link className="linkbtn" href="/auth/signin">Sign in</Link>. Never
          verified your address?{" "}
          <Link className="linkbtn" href="/auth/resend-verification">Get a new link</Link>.
        </>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
