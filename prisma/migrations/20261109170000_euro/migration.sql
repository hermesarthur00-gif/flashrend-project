-- Application en euros : montants et cours en EUR, archivage des comptes bancaires de retrait.
ALTER TABLE "user" RENAME COLUMN "cashUsd" TO "cashEur";
ALTER TABLE "Asset" RENAME COLUMN "priceUsd" TO "priceEur";
ALTER TABLE "Deposit" RENAME COLUMN "creditedUsd" TO "creditedEur";
ALTER TABLE "Withdrawal" RENAME COLUMN "amountUsd" TO "amountEur";
ALTER TABLE "Withdrawal" RENAME COLUMN "feeUsd" TO "feeEur";
ALTER TABLE "Activity" RENAME COLUMN "amountUsd" TO "amountEur";
ALTER TABLE "PortfolioSnapshot" RENAME COLUMN "valueUsd" TO "valueEur";
ALTER TABLE "BankAccount" ADD COLUMN "archivedAt" TIMESTAMP(3);
