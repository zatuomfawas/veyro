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
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const raw = (await searchParams).next;
  const next = safeNextPath(Array.isArray(raw) ? raw[0] : raw);

  return (
    <AuthShell
      title="Create your account"
      lead="Founders from 13, with a parent or guardian named on the payment account. Adults signing for someone else can create an account here too."
      footer={
        <>
          Already have an account? <Link className="linkbtn" href={next ? authUrlWithNext("/auth/signin", next) : "/auth/signin"}>Sign in</Link>.
          {" "}Not sure whether this applies where you live?{" "}
          <Link className="linkbtn" href="/check">Check first</Link>. It takes about twenty seconds
          and needs no account.
        </>
      }
    >
      <SignupForm next={next} />
    </AuthShell>
  );
}
