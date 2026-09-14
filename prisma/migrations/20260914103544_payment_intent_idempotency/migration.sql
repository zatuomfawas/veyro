-- DropIndex
DROP INDEX "FounderTransaction_stripeEventId_key";

-- AlterTable
ALTER TABLE "FounderTransaction" DROP COLUMN "stripeEventId",
ADD COLUMN     "stripePaymentIntentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FounderTransaction_stripePaymentIntentId_key" ON "FounderTransaction"("stripePaymentIntentId");

