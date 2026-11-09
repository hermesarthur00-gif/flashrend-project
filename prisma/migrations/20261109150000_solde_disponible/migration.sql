-- Dépôt et investissement séparés : solde disponible, mode de virement, montant déclaré et preuve.
ALTER TYPE "DepositStatus" RENAME VALUE 'INVESTED' TO 'CREDITED';
ALTER TYPE "ActivityType" ADD VALUE 'DIVEST';
CREATE TYPE "DepositMethod" AS ENUM ('STANDARD', 'INSTANT');

ALTER TABLE "user" ADD COLUMN "cashUsd" DECIMAL(18,2) NOT NULL DEFAULT 0;

ALTER TABLE "Deposit"
  ADD COLUMN "method" "DepositMethod" NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "declaredAmount" DECIMAL(18,2),
  ADD COLUMN "proofId" TEXT;
