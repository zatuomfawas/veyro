import { db } from "@/lib/db";
import { defaultProductName } from "@/lib/product-rules";

// The product a founder gets handed on signup.
//
// It exists so the dashboard has a real product id to put in the integration
// snippet on the first visit. Without one the snippet can only show a
// placeholder, and "copy this, then go and make a product, then come back and
// copy it again" is the friction this removes.
//
// It is a DRAFT, deliberately. A LIVE product is one with a working checkout,
// and a founder who signed up ninety seconds ago has no payment account: their
// guardian has not been through Stripe yet, so nothing can be charged. Marking
// it live would put a checkout link in their hands that takes no money and
// tells them nothing about why. The dashboard says which of the two it is.
//
// The seeded values satisfy validateProductFields, so the first edit does not
// open on a row the app's own rules would reject: the name clears NAME_MIN,
// the description clears DESCRIPTION_MIN, and the price clears PRICE_MIN_MINOR
// rather than sitting at the schema's 0, which is below it.

export const DEFAULT_PRICE_MINOR = 500;

const DESCRIPTION =
  "Edit this to say what someone is buying. A sentence is enough — it is what "
  + "they read on the checkout page before they pay.";

/**
 * Creates the starter product, once.
 *
 * Idempotent on "this founder has no products at all" rather than on a name or
 * a flag: a founder who deleted the starter and made their own should not have
 * it reappear, and one who already has products does not need another.
 *
 * Returns the product if it made one, null if there was nothing to do.
 */
export async function ensureDefaultProduct(founderId: string, founderName?: string | null) {
  const existing = await db.founderProduct.count({ where: { founderId } });
  if (existing > 0) return null;

  return db.founderProduct.create({
    data: {
      founderId,
      name: defaultProductName(founderName),
      description: DESCRIPTION,
      priceMinor: DEFAULT_PRICE_MINOR,
      status: "DRAFT",
    },
  });
}
