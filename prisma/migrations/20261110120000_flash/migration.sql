-- Investissement Flash 24 h : offres à rendement fixé par l'admin et souscriptions des clients.
ALTER TYPE "ActivityType" ADD VALUE 'FLASH';
CREATE TYPE "FlashStatus" AS ENUM ('RUNNING', 'MATURED');

CREATE TABLE "FlashOffer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ratePercent" DECIMAL(6,2) NOT NULL,
  "minEur" DECIMAL(18,2) NOT NULL,
  "maxEur" DECIMAL(18,2),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FlashOffer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FlashInvestment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "offerId" TEXT,
  "offerName" TEXT NOT NULL,
  "ratePercent" DECIMAL(6,2) NOT NULL,
  "amountEur" DECIMAL(18,2) NOT NULL,
  "gainEur" DECIMAL(18,2) NOT NULL,
  "status" "FlashStatus" NOT NULL DEFAULT 'RUNNING',
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "settledAt" TIMESTAMP(3),
  CONSTRAINT "FlashInvestment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FlashInvestment_userId_status_idx" ON "FlashInvestment"("userId", "status");
CREATE INDEX "FlashInvestment_status_endsAt_idx" ON "FlashInvestment"("status", "endsAt");

ALTER TABLE "FlashInvestment" ADD CONSTRAINT "FlashInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlashInvestment" ADD CONSTRAINT "FlashInvestment_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "FlashOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
