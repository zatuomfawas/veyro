import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildViewport } from "@/lib/seo";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canTakePayment } from "@/lib/sale-rules";
import { CSS, CSS2 } from "@/app/_ui/css";
import { DashNav, DashHeader, Section, EmptyState, type DashRole } from "@/app/_ui/dash";
import { FocusButton } from "@/app/_ui/FocusButton";
import NewProduct, { NAME_FIELD_ID } from "../NewProduct";
import ProductRows from "../ProductRows";

export const viewport = buildViewport();

export const metadata: Metadata = {
  title: "Your products | Veyro",
  robots: { index: false, follow: false },
};

// Products, on their own page.
//
// They used to be a section of the dashboard, which made the dashboard look
// like a product manager when its job is to show money and hand over a snippet.
// They are NOT deleted: this is the only place in the product where a product
// can be created or edited, and the integration snippet needs a product id to
// be worth pasting. Moving them out of the way is the change; removing them
// would remove the ability to sell anything.
export default async function ProductsPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/signin");
  if (user.role !== "FOUNDER") redirect("/dashboard/guardian");

  const founderId = user.id;
  const [account, products, salesByProduct, viewsByProduct] = await Promise.all([
    db.founderPaymentAccount.findUnique({ where: { founderId } }),
    db.founderProduct.findMany({ where: { founderId }, orderBy: { createdAt: "desc" } }),
    db.founderTransaction.groupBy({
      by: ["productId"],
      where: { founderId, status: "COMPLETED" },
      _count: { _all: true },
    }),
    db.checkoutView.groupBy({ by: ["productId"], where: { founderId }, _sum: { count: true } }),
  ]);

  const salesFor = new Map(salesByProduct.map((r) => [r.productId, r._count?._all ?? 0]));
  const viewsFor = new Map(viewsByProduct.map((r) => [r.productId, r._sum.count ?? 0]));
  const productRows = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceMinor: p.priceMinor,
    currency: p.currency,
    status: p.status,
    priceRecurring: p.priceRecurring,
    sales: salesFor.get(p.id) ?? 0,
    views: viewsFor.get(p.id) ?? 0,
  }));

  return (
    <div className="fw">
      <style>{CSS + CSS2}</style>
      <DashNav role={user.role as DashRole} current="dashboard" />

      <main id="main" className="wrap-w" style={{ paddingTop: 24, paddingBottom: 56 }}>
        <DashHeader
          title="Your products"
          subtitle={
            <>
              What people pay for, and the checkout link for each one.{" "}
              <Link className="linkbtn" href="/dashboard/founder">Back to your money</Link>
            </>
          }
        />

        <Section title={products.length === 0 ? "Make something to sell" : "Live and draft"}>
          {products.length === 0 ? (
            <EmptyState
              heading="No products yet"
              action={<FocusButton target={NAME_FIELD_ID} label="Create your first product" />}
              secondary={{ label: "See what checkout looks like", href: "/get-started" }}
            >
              A product is the thing someone pays for &mdash; a commission slot, a digital file,
              a one-off service. Create one and you get a payment link you can send anywhere.
            </EmptyState>
          ) : (
            <ProductRows
              founderId={founderId}
              founderName={user.name}
              products={productRows}
              paymentsReady={canTakePayment(account)}
            />
          )}

          {products.length > 0 && (
            <>
              <hr className="rule" style={{ margin: "var(--sp-7) 0 var(--sp-5)" }} />
              <h3 className="h4" style={{ margin: "0 0 var(--sp-4)" }}>Add another product</h3>
            </>
          )}
          <NewProduct founderId={founderId} />
        </Section>
      </main>
    </div>
  );
}
