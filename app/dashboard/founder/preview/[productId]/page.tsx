// What a customer would see, shown to the founder who owns the product.
//
// This exists for the draft case. /pay refuses anything that is not LIVE, which
// means the one moment a founder most wants to look — before publishing, asking
// "does this look professional?" — is the one moment the real page will not show
// them. So the preview lives here instead.
//
// It deliberately does NOT add owner-auth to /pay. That page reads no session by
// design: a stranger with a link needs nothing, and widening its threat model
// for a convenience would be a bad trade on the page where money moves. This
// route sits under /dashboard/founder and authenticates the way the rest of the
// dashboard does.
//
// The looking is in PreviewBody, which takes plain values and touches neither
// the session nor the database, so every case it can render is checkable
// without an account. This file does auth, ownership and the queries.

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { buildViewport } from "@/lib/seo";
import { saleBlockers } from "@/lib/checkout";
import { CSS, CSS2 } from "@/app/_ui/css";
import { SkipLink } from "@/app/_ui/marks";
import { PreviewBody, PreviewChrome } from "../PreviewBody";

export const viewport = buildViewport();

// Behind a session, about one founder's unpublished product. Never cached,
// never indexed.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Preview | Veyro",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const user = await currentUser();
  if (!user) redirect("/");
  // Not "is a guardian": an admin landing here would otherwise be shown a
  // preview scoped to their own id, which is the founder dashboard's rule too.
  if (user.role !== "FOUNDER") redirect("/");

  const product = await db.founderProduct.findUnique({ where: { id: productId } });

  // One answer for "no such product" and "not yours", the same rule
  // resolvePurchasable uses: a different 404 would confirm that someone else's
  // product exists, which is not this founder's business.
  if (!product || product.founderId !== user.id) notFound();

  const account = await db.founderPaymentAccount.findUnique({ where: { founderId: user.id } });

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <SkipLink />
      <PreviewChrome />
      <PreviewBody
        name={product.name}
        description={product.description}
        priceMinor={product.priceMinor}
        currency={product.currency}
        recurring={product.priceRecurring}
        status={product.status}
        sellerName={user.name}
        blockers={saleBlockers(product, account)}
        payHref={product.status === "LIVE" ? `/pay/${user.id}/${product.id}` : null}
      />
    </div>
  );
}
