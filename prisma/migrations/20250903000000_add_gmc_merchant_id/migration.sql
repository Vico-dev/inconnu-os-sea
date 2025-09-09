-- Add optional Merchant Center Merchant ID to client_accounts
ALTER TABLE "client_accounts"
ADD COLUMN IF NOT EXISTS "merchantCenterMerchantId" TEXT;