-- Checkout view counts, for the analytics on the founder dashboard.
--
-- Purely additive: one new table, no column added to or removed from anything
-- that already exists, so this cannot disturb a row of money. Verified with
-- `prisma migrate diff`, which produced exactly the statements below.
--
-- One row per product per day rather than one per view. The dashboard reports
-- days, so days are the grain; storing every hit would grow without bound to
-- answer a question at a resolution nothing asks for.
--
-- The unique index on (productId, day) is what makes the recorder an upsert: a
-- concurrent second view for the same product on the same day loses the insert
-- race and increments instead of creating a duplicate day.

-- CreateTable
CREATE TABLE "CheckoutView" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CheckoutView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckoutView_founderId_day_idx" ON "CheckoutView"("founderId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutView_productId_day_key" ON "CheckoutView"("productId", "day");

-- AddForeignKey
ALTER TABLE "CheckoutView" ADD CONSTRAINT "CheckoutView_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutView" ADD CONSTRAINT "CheckoutView_productId_fkey" FOREIGN KEY ("productId") REFERENCES "FounderProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

