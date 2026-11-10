-- E-mails envoyés depuis l'admin.
CREATE TYPE "BroadcastAudience" AS ENUM ('ALL', 'USER', 'CUSTOM');
CREATE TYPE "BroadcastStatus" AS ENUM ('SENDING', 'DONE');

CREATE TABLE "EmailBroadcast" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "bodyHtml" TEXT NOT NULL,
  "audience" "BroadcastAudience" NOT NULL,
  "target" TEXT,
  "recipients" INTEGER NOT NULL,
  "sent" INTEGER NOT NULL DEFAULT 0,
  "failed" INTEGER NOT NULL DEFAULT 0,
  "attachments" JSONB,
  "status" "BroadcastStatus" NOT NULL DEFAULT 'SENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  CONSTRAINT "EmailBroadcast_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailBroadcast_createdAt_idx" ON "EmailBroadcast"("createdAt");

ALTER TABLE "EmailBroadcast" ADD CONSTRAINT "EmailBroadcast_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
