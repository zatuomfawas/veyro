import { SkipLink } from "@/app/_ui/marks";
import { SiteNav } from "@/app/_ui/SiteNav";

/** Shared frame for sign-in, signup, verification and account recovery. */
export function AuthShell({
  title, lead, children, footer, aside,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  /** Optional extra context for the left column. */
  aside?: React.ReactNode;
}) {
  return (
    <div className="fw auth-page">
      <SkipLink />

      <SiteNav />

      <main id="main" className="wrap-lp auth-main">
        <div className="truthgrid auth-layout">
          <div className="auth-intro">
            <h1 className="d2 auth-title">{title}</h1>
            <p className="body auth-lead">{lead}</p>
            <p className="small auth-footer">{footer}</p>
            {aside && <div className="auth-aside">{aside}</div>}
          </div>

          <div className="card auth-form">
            <div className="card-b">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
