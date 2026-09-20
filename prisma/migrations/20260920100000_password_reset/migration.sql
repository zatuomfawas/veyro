-- Password reset tokens. Hash-only, like every other token in this schema, and
-- nullable with no backfill: NULL correctly means "no reset outstanding" for
-- every existing row.
ALTER TABLE "User" ADD COLUMN "passwordResetTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3);

-- Unique so a token can be looked up directly, and so two accounts can never
-- hold the same reset token.
CREATE UNIQUE INDEX "User_passwordResetTokenHash_key" ON "User"("passwordResetTokenHash");
