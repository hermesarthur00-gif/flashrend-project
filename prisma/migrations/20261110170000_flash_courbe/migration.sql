-- Courbe de progression du rendement Flash : graine propre à chaque investissement.
ALTER TABLE "FlashInvestment" ADD COLUMN "seed" INTEGER NOT NULL DEFAULT 0;
