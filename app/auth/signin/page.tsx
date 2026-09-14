import Link from "next/link";
import { buildMetadata, buildViewport } from "@/lib/seo";
import { AuthShell } from "@/app/_ui/AuthShell";
import SigninForm from "./SigninForm";

export const metadata = buildMetadata("signin");
export const viewport = buildViewport();

export default function SigninPage() {
  return (
    <AuthShell
      title="Sign in"
      lead="For founders and for the guardians who signed for them."
      footer={
        <>
          No account yet? <Link className="linkbtn" href="/auth/signup">Create one</Link>.
        </>
      }
    >
      <SigninForm />
    </AuthShell>
  );
}
