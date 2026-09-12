-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FOUNDER', 'GUARDIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('SAAS', 'DIGITAL_PRODUCT', 'SERVICE', 'CONTENT', 'OTHER');

-- CreateEnum
CREATE TYPE "RevenueModel" AS ENUM ('SUBSCRIPTION', 'ONE_TIME', 'USAGE', 'MIXED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED', 'ENDED');

-- CreateEnum
CREATE TYPE "ProviderId" AS ENUM ('SANDBOX', 'STRIPE_CONNECT', 'ADYEN_PLATFORMS');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('NOT_STARTED', 'AWAITING_GUARDIAN', 'PENDING', 'REQUIREMENTS_DUE', 'ACTIVE', 'RESTRICTED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "EntryKind" AS ENUM ('CHARGE', 'REFUND', 'DISPUTE_HOLD', 'DISPUTE_RELEASE', 'DISPUTE_LOSS', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "EntryBucket" AS ENUM ('PENDING', 'AVAILABLE', 'HELD', 'REVERSED');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('SUCCEEDED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'DISPUTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('AWAITING_APPROVAL', 'IN_TRANSIT', 'PAID', 'FAILED', 'DECLINED', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "passwordHash" TEXT,
    "totpSecret" TEXT,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "countryCode" CHAR(2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BusinessType" NOT NULL,
    "url" TEXT,
    "description" TEXT NOT NULL,
    "revenueModel" "RevenueModel" NOT NULL,
    "priceMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "countryCode" CHAR(2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuardianRelationship" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "guardianId" TEXT,
    "invitedName" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "tokenHash" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "approvePayouts" BOOLEAN NOT NULL DEFAULT true,
    "payoutThresholdMinor" INTEGER NOT NULL DEFAULT 0,
    "approveProviderChanges" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GuardianRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAccount" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "provider" "ProviderId" NOT NULL,
    "providerAccountId" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "representativeUserId" TEXT,
    "requirementsDue" JSONB NOT NULL DEFAULT '[]',
    "settlementDays" INTEGER NOT NULL DEFAULT 2,
    "destinationBankName" TEXT,
    "destinationLast4" CHAR(4),
    "destinationVerified" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "parentId" TEXT,
    "kind" "EntryKind" NOT NULL,
    "bucket" "EntryBucket" NOT NULL DEFAULT 'PENDING',
    "status" "EntryStatus" NOT NULL DEFAULT 'SUCCEEDED',
    "grossMinor" INTEGER NOT NULL,
    "feeMinor" INTEGER NOT NULL DEFAULT 0,
    "netMinor" INTEGER NOT NULL,
    "refundedMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "customerRef" TEXT,
    "description" TEXT NOT NULL,
    "availableOn" TIMESTAMP(3) NOT NULL,
    "isSandbox" BOOLEAN NOT NULL DEFAULT false,
    "providerRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "status" "PayoutStatus" NOT NULL DEFAULT 'AWAITING_APPROVAL',
    "destination" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failureCode" TEXT,
    "failureText" TEXT,
    "providerRef" TEXT,
    "isSandbox" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "routeName" TEXT,
    "routeId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "businessId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" "ProviderId" NOT NULL,
    "providerRef" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signatureOk" BOOLEAN NOT NULL,
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Business_founderId_idx" ON "Business"("founderId");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianRelationship_businessId_key" ON "GuardianRelationship"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "GuardianRelationship_tokenHash_key" ON "GuardianRelationship"("tokenHash");

-- CreateIndex
CREATE INDEX "GuardianRelationship_invitedEmail_status_idx" ON "GuardianRelationship"("invitedEmail", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAccount_businessId_key" ON "PaymentAccount"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAccount_providerAccountId_key" ON "PaymentAccount"("providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_providerRef_key" ON "LedgerEntry"("providerRef");

-- CreateIndex
CREATE INDEX "LedgerEntry_businessId_bucket_idx" ON "LedgerEntry"("businessId", "bucket");

-- CreateIndex
CREATE INDEX "LedgerEntry_businessId_createdAt_idx" ON "LedgerEntry"("businessId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_providerRef_key" ON "Payout"("providerRef");

-- CreateIndex
CREATE INDEX "Payout_businessId_status_idx" ON "Payout"("businessId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "AuditEvent_businessId_createdAt_idx" ON "AuditEvent"("businessId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_providerRef_key" ON "WebhookEvent"("provider", "providerRef");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianRelationship" ADD CONSTRAINT "GuardianRelationship_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuardianRelationship" ADD CONSTRAINT "GuardianRelationship_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAccount" ADD CONSTRAINT "PaymentAccount_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "LedgerEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
