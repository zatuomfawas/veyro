import Link from "next/link";
import type { Metadata } from "next";
import { buildViewport } from "@/lib/seo";
import { AuthShell } from "@/app/_ui/AuthShell";
import { Notice } from "@/app/_ui/form";
import ResetForm from "./ResetForm";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Set a new password | Veyro",
  robots: { index: false, follow: false },
};

// Nothing here reads or spends the token. The page renders a form; the POST
// behind it does the work. See ResetForm for why that separation matters.
export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const raw = (await searchParams).token;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim();

  if (!token) {
    return (
      <AuthShell
        title="This link is incomplete"
        lead="A reset link carries a code, and this one arrived without it."
        footer={
          <>
            Know your password? <Link className="linkbtn" href="/auth/signin">Sign in</Link>.
          </>
        }
      >
        <Notice tone="amber" head="Ask for another">
          <p style={{ margin: "0 0 12px" }}>
            Some mail apps shorten long links, which drops the code. Nothing has changed on your
            account.
          </p>
          <Link className="btn" href="/auth/forgot-password">Send me a new link</Link>
        </Notice>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      lead="Choose a new password. Saving it signs out every device that was signed in."
      footer={
        <>
          Changed your mind? <Link className="linkbtn" href="/auth/signin">Sign in</Link> with
          your old password. It still works until you set a new one.
        </>
      }
    >
      <ResetForm token={token} />
    </AuthShell>
  );
}
