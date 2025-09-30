-- CreateIndex
CREATE INDEX "api_keys_userId_idx" ON "public"."api_keys"("userId");

-- CreateIndex
CREATE INDEX "api_keys_isActive_idx" ON "public"."api_keys"("isActive");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "public"."orders"("userId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "public"."orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "public"."orders"("createdAt");

-- CreateIndex
CREATE INDEX "orders_userId_createdAt_idx" ON "public"."orders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "points_history_userId_idx" ON "public"."points_history"("userId");

-- CreateIndex
CREATE INDEX "points_history_createdAt_idx" ON "public"."points_history"("createdAt");

-- CreateIndex
CREATE INDEX "points_history_userId_createdAt_idx" ON "public"."points_history"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "public"."subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions"("status");

