-- DropIndex
DROP INDEX "public"."teams_ownerId_key";

-- AlterTable
ALTER TABLE "public"."points_balances" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3);
