-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'LIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FounderTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'SENT', 'FAILED');

-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_founderId_fkey";

-- DropForeignKey
ALTER TABLE "GuardianRelationship" DROP CONSTRAINT "GuardianRelationship_businessId_fkey";

-- DropForeignKey
ALTER TABLE "GuardianRelationship" DROP CONSTRAINT "GuardianRelationship_guardianId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_businessId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_parentId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentAccount" DROP CONSTRAINT "PaymentAccount_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_businessId_fkey";

-- DropIndex
DROP INDEX "AuditEvent_businessId_createdAt_idx";

-- AlterTable
ALTER TABLE "AuditEvent" DROP COLUMN "businessId",
ADD COLUMN     "founderId" TEXT;

-- DropTable
DROP TABLE "Business";

-- DropTable
DROP TABLE "GuardianRelationship";

-- DropTable
DROP TABLE "LedgerEntry";

-- DropTable
DROP TABLE "PaymentAccount";

-- DropTable
DROP TABLE "Payout";

-- DropEnum
DROP TYPE "BusinessType";

-- DropEnum
DROP TYPE "EntryBucket";

-- DropEnum
DROP TYPE "EntryKind";

-- DropEnum
DROP TYPE "EntryStatus";

-- DropEnum
DROP TYPE "InvitationStatus";

-- DropEnum
DROP TYPE "PayoutStatus";

-- DropEnum
DROP TYPE "RevenueModel";

-- CreateTable
CREATE TABLE "FounderProduct" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "priceRecurring" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FounderProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderTransaction" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "status" "FounderTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "stripeEventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FounderTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderPayoutRequest" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "status" "PayoutRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FounderPayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianConsent" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "guardianId" TEXT,
    "invitedEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviteExpiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "consentedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "GuardianConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderPaymentAccount" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "provider" "ProviderId" NOT NULL,
    "providerAccountId" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "representativeUserId" TEXT,
    "requirementsDue" JSONB NOT NULL DEFAULT '[]',
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FounderPaymentAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FounderProduct_founderId_status_idx" ON "FounderProduct"("founderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FounderTransaction_stripeEventId_key" ON "FounderTransaction"("stripeEventId");

-- CreateIndex
CREATE INDEX "FounderTransaction_founderId_createdAt_idx" ON "FounderTransaction"("founderId", "createdAt");

-- CreateIndex
CREATE INDEX "FounderTransaction_founderId_status_idx" ON "FounderTransaction"("founderId", "status");

-- CreateIndex
CREATE INDEX "FounderTransaction_productId_idx" ON "FounderTransaction"("productId");

-- CreateIndex
CREATE INDEX "FounderPayoutRequest_founderId_status_idx" ON "FounderPayoutRequest"("founderId", "status");

-- CreateIndex
CREATE INDEX "FounderPayoutRequest_founderId_createdAt_idx" ON "FounderPayoutRequest"("founderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianConsent_founderId_key" ON "GuardianConsent"("founderId");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianConsent_tokenHash_key" ON "GuardianConsent"("tokenHash");

-- CreateIndex
CREATE INDEX "GuardianConsent_invitedEmail_idx" ON "GuardianConsent"("invitedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "FounderPaymentAccount_founderId_key" ON "FounderPaymentAccount"("founderId");

-- CreateIndex
CREATE UNIQUE INDEX "FounderPaymentAccount_providerAccountId_key" ON "FounderPaymentAccount"("providerAccountId");

-- CreateIndex
CREATE INDEX "AuditEvent_founderId_createdAt_idx" ON "AuditEvent"("founderId", "createdAt");

-- AddForeignKey
ALTER TABLE "FounderProduct" ADD CONSTRAINT "FounderProduct_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FounderTransaction" ADD CONSTRAINT "FounderTransaction_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FounderTransaction" ADD CONSTRAINT "FounderTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "FounderProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FounderPayoutRequest" ADD CONSTRAINT "FounderPayoutRequest_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianConsent" ADD CONSTRAINT "GuardianConsent_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianConsent" ADD CONSTRAINT "GuardianConsent_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FounderPaymentAccount" ADD CONSTRAINT "FounderPaymentAccount_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

