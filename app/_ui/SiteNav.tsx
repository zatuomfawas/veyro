import Link from "next/link";
import { Wordmark } from "@/app/_ui/marks";
import { MobileNav, type NavItem } from "@/app/_ui/MobileNav";
import { ThemeToggle } from "@/app/_ui/ThemeToggle";
import { defaultLandingFor } from "@/lib/next-path";

const LINKS: NavItem[] = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-parents", label: "For parents" },
  { href: "/pricing", label: "Pricing" },
];

/** Shared public navigation; session data is supplied only by pages that read it. */
export function SiteNav({
  active, cta, user,
}: {
  active?: string;
  cta?: { href: string; label: string };
  user?: { role: string } | null;
}) {
  const action = cta ?? (user
    ? { href: defaultLandingFor(user.role), label: "Dashboard" }
    : { href: "/check", label: "Check eligibility" });
  const account = user
    ? { href: defaultLandingFor(user.role), label: "Dashboard" }
    : { href: "/auth/signin", label: "Sign in" };
  const mobileItems = [
    ...LINKS,
    { href: "/get-started", label: "Get started" },
    { href: "/faq", label: "Questions" },
    account,
  ].filter((item) => item.href !== action.href);

  return (
    <header className="navbar site-navbar">
      <div className="wrap-lp">
        <nav className="lp-nav site-nav" aria-label="Main">
          <Link className="site-nav-brand" href="/" aria-label="Veyro, home">
            <Wordmark size={21} tile />
          </Link>
          <div className="lp-links">
            {LINKS.map((item) => (
              <Link
                key={item.href}
                className="btn btn-q btn-sm hide-s nav-link"
                href={item.href}
                aria-current={active === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link className="btn btn-q btn-sm hide-s nav-signin" href={account.href}>
                {account.label}
              </Link>
            )}
            <Link className="btn btn-sm nav-primary" href={action.href}>
              {action.label}
            </Link>
            <ThemeToggle />
            <MobileNav items={mobileItems} active={active} />
          </div>
        </nav>
      </div>
    </header>
  );
}
