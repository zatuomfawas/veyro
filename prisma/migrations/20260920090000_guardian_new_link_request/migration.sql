-- Records that an invited adult opened an expired invite and asked for a fresh
-- link. Nullable with no backfill: every existing row correctly means "no
-- request outstanding", which is exactly what NULL says here.
ALTER TABLE "GuardianConsent" ADD COLUMN "newLinkRequestedAt" TIMESTAMP(3);
