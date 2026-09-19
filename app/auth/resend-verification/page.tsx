import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport } from "@/lib/seo";
import { AuthShell } from "@/app/_ui/AuthShell";
import ResendForm from "./ResendForm";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Send a new verification link | Veyro",
  robots: { index: false, follow: false },
};

export default function ResendVerification() {
  return (
    <AuthShell
      title="Send a new link"
      lead="Verification links last 24 hours and work once. If yours has expired, get another."
      footer={
        <>
          Already verified? <Link className="linkbtn" href="/auth/signin">Sign in</Link>.
        </>
      }
    >
      <ResendForm />
    </AuthShell>
  );
}
