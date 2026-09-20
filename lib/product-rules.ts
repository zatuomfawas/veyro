// What a product is allowed to be.
//
// Shared by POST /api/founder/products and PATCH on a single product, so the
// two cannot drift. A price the create route rejects must not be reachable by
// creating something cheap and editing it afterwards, and that is exactly the
// kind of gap that opens when the same rules are written twice.

export const PRODUCT_STATUSES = ["DRAFT", "LIVE", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/** $0.01. Below this no card network will process a charge. */
export const PRICE_MIN_MINOR = 1;
/** $999,999.99. The same ceiling the form shows. */
export const PRICE_MAX_MINOR = 99_999_999;

export const NAME_MAX = 120;
export const DESCRIPTION_MAX = 500;

export const NAME_MIN = 2;
export const DESCRIPTION_MIN = 10;

/**
 * Validate the fields that were actually supplied.
 *
 * Create passes all of them. Edit passes only what changed, so absent is not
 * the same as empty here: `cap(undefined, 120)` returns "", and treating that
 * as "the founder cleared the name" would fail an edit that never mentioned
 * the name. Callers decide what is present; this only judges what it is given.
 */
export function validateProductFields(f: {
  name?: string;
  description?: string;
  priceMinor?: number;
  currency?: string;
  status?: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (f.name !== undefined && f.name.length < NAME_MIN) {
    errors.name = "Give the product a name.";
  }
  if (f.description !== undefined && f.description.length < DESCRIPTION_MIN) {
    errors.description = "Describe what the customer is paying for.";
  }
  if (f.priceMinor !== undefined) {
    if (!Number.isInteger(f.priceMinor)) {
      errors.priceMinor = "Price must be a whole number of minor units.";
    } else if (f.priceMinor < PRICE_MIN_MINOR || f.priceMinor > PRICE_MAX_MINOR) {
      errors.priceMinor = "Price must be between $0.01 and $999,999.99.";
    }
  }
  if (f.currency !== undefined && !/^[A-Z]{3}$/.test(f.currency)) {
    errors.currency = "Currency must be a three-letter code.";
  }
  if (f.status !== undefined && !PRODUCT_STATUSES.includes(f.status as ProductStatus)) {
    errors.status = "Choose a valid status.";
  }

  return errors;
}
