-- CreateEnum
CREATE TYPE "DisputeState" AS ENUM ('NEEDS_RESPONSE', 'UNDER_REVIEW', 'WON', 'LOST', 'WARNING_CLOSED', 'OTHER');

-- CreateEnum
CREATE TYPE "ReviewState" AS ENUM ('DRAFT', 'APPROVED', 'SENT', 'DISCARDED');

-- AlterTable
ALTER TABLE "FounderTransaction" ADD COLUMN     "disputedMinor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exchangeRate" DECIMAL(20,10),
ADD COLUMN     "refundedMinor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usdAmountMinor" INTEGER;

-- CreateTable
CREATE TABLE "MonthlyLedger" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "month" CHAR(7) NOT NULL,
    "qmeMinor" INTEGER NOT NULL DEFAULT 0,
    "feeCollectedMinor" INTEGER NOT NULL DEFAULT 0,
    "feeReservedMinor" INTEGER NOT NULL DEFAULT 0,
    "thresholdNotifiedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderDispute" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "stripeDisputeId" TEXT NOT NULL,
    "stripeChargeId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "state" "DisputeState" NOT NULL DEFAULT 'NEEDS_RESPONSE',
    "evidenceDueBy" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FounderDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthReviewDraft" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "month" CHAR(7) NOT NULL,
    "findings" JSONB NOT NULL,
    "summary" TEXT,
    "state" "ReviewState" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthReviewDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyLedger_month_idx" ON "MonthlyLedger"("month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyLedger_founderId_month_key" ON "MonthlyLedger"("founderId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "FounderDispute_stripeDisputeId_key" ON "FounderDispute"("stripeDisputeId");

-- CreateIndex
CREATE INDEX "FounderDispute_founderId_state_idx" ON "FounderDispute"("founderId", "state");

-- CreateIndex
CREATE INDEX "FounderDispute_founderId_openedAt_idx" ON "FounderDispute"("founderId", "openedAt");

-- CreateIndex
CREATE INDEX "HealthReviewDraft_state_idx" ON "HealthReviewDraft"("state");

-- CreateIndex
CREATE UNIQUE INDEX "HealthReviewDraft_founderId_month_key" ON "HealthReviewDraft"("founderId", "month");

-- AddForeignKey
ALTER TABLE "MonthlyLedger" ADD CONSTRAINT "MonthlyLedger_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FounderDispute" ADD CONSTRAINT "FounderDispute_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthReviewDraft" ADD CONSTRAINT "HealthReviewDraft_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

