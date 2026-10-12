// The one invented month, shared by everything that shows a wallet.
//
// It used to live inside LiveWallet, which was fine while LiveWallet was the
// only thing drawing it. The hero shows a smaller, calmer version of the
// same account now, and two components inventing their own figures is how
// the homepage ends up quoting $195 while /how-it-works quotes $190 -- a
// discrepancy nobody would catch, in the one kind of number a visitor
// checks.
//
// The arithmetic has to survive a sceptical parent adding it up:
//
//   210.00 collected
//  -  8.55 the processor's fee
//  -  3.30 Veyro's fee, computed, not typed
//  -  3.15 still settling
//  = 195.00 available
//
// Every figure here is invented, and every surface that renders them says so
// where a reader can see it.
import { feeMinor } from "@/lib/pricing";

export const COLLECTED_MINOR = 21000;
export const PROCESSING_MINOR = 855;
export const SETTLING_MINOR = 315;

/**
 * Not a literal. The example fee is computed by the same function that
 * decides what a founder is actually charged, so a change to the pricing
 * model cannot leave a wrong number sitting in the hero.
 */
export const VEYRO_FEE_MINOR = feeMinor(COLLECTED_MINOR);

export const BALANCE_MINOR =
  COLLECTED_MINOR - PROCESSING_MINOR - VEYRO_FEE_MINOR - SETTLING_MINOR;

/**
 * One product, for the hero.
 *
 * The hero used to show the month's available balance, which is an abstract
 * figure a visitor has no way to relate to: $195.00 arrives from nowhere and
 * the only thing it teaches is that the product has a wallet screen. A
 * fifteen-year-old reading it learns nothing they can act on.
 *
 * A single product does teach something. A price they might charge, a number
 * of sales they can picture, the total that produces, and what Veyro takes
 * out of it -- which on this example is $1.32, because the first $100 each
 * month is free. That is the arithmetic somebody actually does in their head
 * before deciding whether to bother.
 *
 * Earned and fee are both computed. 12 x $12.00 is $144.00, and feeMinor()
 * is the same function that charges a real founder, so neither figure can
 * drift from the rule it demonstrates.
 */
export const PRODUCT_NAME = "Notion Second Brain template";
export const PRODUCT_PRICE_MINOR = 1200;
export const PRODUCT_SALES = 12;
export const PRODUCT_EARNED_MINOR = PRODUCT_PRICE_MINOR * PRODUCT_SALES;
export const PRODUCT_FEE_MINOR = feeMinor(PRODUCT_EARNED_MINOR);

/** The sale LiveWallet animates into the ledger. */
export const SALE_GROSS_MINOR = 2400;
export const SALE_FEE_MINOR = 86;
export const SALE_NAME = "Notion Second Brain template";
/** Its date, so the hero's two rows do not both read "2 Oct". */
export const SALE_WHEN = "4 Oct";

/** Settled rows, newest first. */
export const PRIOR = [
  { name: "Commission slot", sub: "Paid", when: "2 Oct", amt: 4339 },
  { name: "Sticker pack", sub: "Paid", when: "28 Sept", amt: 1135 },
] as const;
