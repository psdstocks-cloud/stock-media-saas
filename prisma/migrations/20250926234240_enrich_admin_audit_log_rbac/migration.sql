-- AlterTable
ALTER TABLE "public"."admin_audit_logs" ADD COLUMN     "permission" TEXT,
ADD COLUMN     "permissionSnapshot" TEXT,
ADD COLUMN     "reason" TEXT;
