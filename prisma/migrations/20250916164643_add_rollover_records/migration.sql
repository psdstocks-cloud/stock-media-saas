/*
  Warnings:

  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "emailVerified" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."verification_tokens";

-- CreateTable
CREATE TABLE "public"."rollover_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rollover_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rollover_records_userId_idx" ON "public"."rollover_records"("userId");

-- CreateIndex
CREATE INDEX "rollover_records_expiresAt_idx" ON "public"."rollover_records"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."rollover_records" ADD CONSTRAINT "rollover_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
