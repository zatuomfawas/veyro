import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { AuthShell } from "@/app/_ui/AuthShell";
import SignupForm from "./SignupForm";
import { safeNextPath, authUrlWithNext } from "@/lib/next-path";

export const metadata = buildMetadata("signup");
export const viewport = buildViewport();

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; role?: string }>;
}) {
  const params = await searchParams;
  const raw = params.next;
  const next = safeNextPath(Array.isArray(raw) ? raw[0] : raw);

  return (
    <AuthShell
      title="Create your account"
      lead="For founders building a business and the adults helping them. Use your own details."
      aside={
        <div className="auth-next-steps">
          <h2>What happens next</h2>
          <ol>
            <li><strong>Create your account</strong><span>Choose founder or guardian and enter your own details.</span></li>
            <li><strong>Verify your email</strong><span>Use the link we send before signing in.</span></li>
            <li><strong>Connect with your guardian or founder</strong><span>Founders send an invite. Guardians open their invite to review and accept.</span></li>
          </ol>
          <p className="small"><Link className="linkbtn" href="/check">Check eligibility first</Link> if you are unsure. No account needed.</p>
        </div>
      }
      footer={
        <>
          Already have an account? <Link className="linkbtn" href={next ? authUrlWithNext("/auth/signin", next) : "/auth/signin"}>Sign in</Link>.
        </>
      }
    >
      <SignupForm next={next} initialGuardian={params.role === "guardian"} />
    </AuthShell>
  );
}
