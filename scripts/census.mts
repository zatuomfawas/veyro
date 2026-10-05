/**
 * A read-only head count, for deciding who a notice has to reach.
 *
 *   DATABASE_URL="<production url>" npx tsx scripts/census.mts
 *
 * Counts rows and nothing else. No writes, no emails, and no personal data is
 * read out -- only totals, so the output is safe to paste into a thread.
 *
 * This exists because the production DATABASE_URL is a Vercel Secret and
 * cannot be pulled with `vercel env pull`, so the number has to be taken by
 * somebody who holds the credential. Run it rather than guessing: "I think
 * it's about ten people" is not a basis for deciding whether a 30-day notice
 * is required.
 */
import { db } from "../lib/db.ts";

const [users, founders, guardians, accounts, active, consents, products, tx, payouts] =
  await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "FOUNDER" } }),
    db.user.count({ where: { role: "GUARDIAN" } }),
    db.founderPaymentAccount.count(),
    db.founderPaymentAccount.count({ where: { status: "ACTIVE" } }),
    db.guardianConsent.count(),
    db.founderProduct.count(),
    db.founderTransaction.count(),
    db.founderPayoutRequest.count(),
  ]);

const byStatus = await db.founderPaymentAccount.groupBy({ by: ["status"], _count: true });

console.log(JSON.stringify({
  users, founders, guardians,
  paymentAccounts: accounts,
  activeAccounts: active,
  accountsByStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count])),
  guardianConsents: consents,
  products, transactions: tx, payouts,
}, null, 1));

await db.$disconnect();
