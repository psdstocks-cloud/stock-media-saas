/*
  Warnings:

  - A unique constraint covering the columns `[service]` on the table `system_health` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."system_health_service_idx";

-- CreateIndex
CREATE UNIQUE INDEX "system_health_service_key" ON "public"."system_health"("service");
