-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationExpiresAt" TIMESTAMP(3),
ADD COLUMN     "emailVerificationTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationTokenHash_key" ON "User"("emailVerificationTokenHash");


-- Backfill. Every account that existed before verification did has a null
-- emailVerifiedAt, and the signin gate refuses a null, so without this line the
-- first deploy would lock out every existing user, including the production
-- accounts staged for the payment test. People who signed up before a rule
-- existed should not be punished by it; the gate applies to new signups.
UPDATE "User" SET "emailVerifiedAt" = NOW() WHERE "emailVerifiedAt" IS NULL;
