-- Liens de détail dans l'activité et demandes de remboursement de dépôt.
ALTER TYPE "ActivityType" ADD VALUE 'REFUND';
ALTER TABLE "Activity" ADD COLUMN "href" TEXT;

CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'REFUNDED', 'REJECTED');
CREATE TYPE "RefundReason" AS ENUM ('MISTAKE', 'DUPLICATE', 'OTHER');

CREATE TABLE "RefundRequest" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "depositId" TEXT NOT NULL,
  "amountEur" DECIMAL(18,2) NOT NULL,
  "reason" "RefundReason" NOT NULL,
  "details" TEXT,
  "status" "RefundStatus" NOT NULL DEFAULT 'REQUESTED',
  "adminNote" TEXT,
  "bankReference" TEXT,
  "processedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RefundRequest_reference_key" ON "RefundRequest"("reference");
CREATE INDEX "RefundRequest_userId_createdAt_idx" ON "RefundRequest"("userId", "createdAt");
CREATE INDEX "RefundRequest_status_createdAt_idx" ON "RefundRequest"("status", "createdAt");
CREATE INDEX "RefundRequest_depositId_idx" ON "RefundRequest"("depositId");

ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
