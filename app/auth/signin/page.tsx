import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { AuthShell } from "@/app/_ui/AuthShell";
import SigninForm from "./SigninForm";
import { safeNextPath, authUrlWithNext } from "@/lib/next-path";

export const metadata = buildMetadata("signin");
export const viewport = buildViewport();

// searchParams is read here rather than with useSearchParams() in the form:
// Next fails the build if a static page's client component calls that without a
// Suspense boundary, and this keeps the decision on the server.
export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; verified?: string }>;
}) {
  const params = await searchParams;
  const raw = params.next;
  const next = safeNextPath(Array.isArray(raw) ? raw[0] : raw);

  return (
    <AuthShell
      title="Sign in"
      lead="For founders and for the guardians who signed for them."
      footer={
        <>
          No account yet? <Link className="linkbtn" href={next ? authUrlWithNext("/auth/signup", next) : "/auth/signup"}>Create one</Link>.
        </>
      }
    >
      <SigninForm next={next} justVerified={params.verified === "1"} />
    </AuthShell>
  );
}
