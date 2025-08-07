-- CreateTable
CREATE TABLE "google_ads_permissions" (
    "id" TEXT NOT NULL,
    "clientAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleAdsCustomerId" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_ads_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_ads_permissions_clientAccountId_googleAdsCustomerId_key" ON "google_ads_permissions"("clientAccountId", "googleAdsCustomerId");

-- AddForeignKey
ALTER TABLE "google_ads_permissions" ADD CONSTRAINT "google_ads_permissions_clientAccountId_fkey" FOREIGN KEY ("clientAccountId") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_ads_permissions" ADD CONSTRAINT "google_ads_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
