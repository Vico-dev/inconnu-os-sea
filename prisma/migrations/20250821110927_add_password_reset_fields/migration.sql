/*
  Warnings:

  - A unique constraint covering the columns `[clientAccountId,name]` on the table `campaigns` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeInvoiceId]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passwordResetToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "client_accounts" ADD COLUMN     "assignedAccountManagerId" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "invoicePdfUrl" TEXT,
ADD COLUMN     "invoiceUrl" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "stripeInvoiceId" TEXT,
ALTER COLUMN "dueDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorEnabledAt" TIMESTAMP(3),
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "advertising_mandates" (
    "id" TEXT NOT NULL,
    "clientAccountId" TEXT NOT NULL,
    "mandateNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "signedByName" TEXT,
    "signedByEmail" TEXT,
    "signedAt" TIMESTAMP(3),
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "documentUrl" TEXT,
    "totalAnnualBudget" DOUBLE PRECISION,
    "monthlyBudgets" JSONB,
    "budgetType" TEXT,
    "treasuryManagement" BOOLEAN NOT NULL DEFAULT false,
    "managementFees" DOUBLE PRECISION,
    "paymentTerms" TEXT,
    "consentData" JSONB,
    "scrollTracking" JSONB,
    "emailConfirmation" JSONB,
    "legalVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "gdprAccepted" BOOLEAN NOT NULL DEFAULT false,
    "signatureCode" TEXT,
    "signatureVerified" BOOLEAN NOT NULL DEFAULT false,
    "signatureExpiresAt" TIMESTAMP(3),
    "initiatedBy" TEXT NOT NULL DEFAULT 'CLIENT',
    "prefilledByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "prefilledAt" TIMESTAMP(3),
    "editableByClient" BOOLEAN NOT NULL DEFAULT false,
    "inviteToken" TEXT,
    "invitationSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertising_mandates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clientAccountId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_campaigns" (
    "id" TEXT NOT NULL,
    "clientAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "industry" TEXT,
    "targetAudience" TEXT,
    "budget" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "aiGeneratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "scrapedData" JSONB,
    "keywords" JSONB,
    "adCopy" JSONB,
    "headlines" JSONB,
    "descriptions" JSONB,
    "landingPages" JSONB,
    "performanceScore" DOUBLE PRECISION,
    "relevanceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_tasks" (
    "id" TEXT NOT NULL,
    "clientAccountId" TEXT NOT NULL,
    "campaignId" TEXT,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "advertising_mandates_mandateNumber_key" ON "advertising_mandates"("mandateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "advertising_mandates_inviteToken_key" ON "advertising_mandates"("inviteToken");

-- CreateIndex
CREATE INDEX "advertising_mandates_clientAccountId_idx" ON "advertising_mandates"("clientAccountId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_clientAccountId_idx" ON "notifications"("clientAccountId");

-- CreateIndex
CREATE INDEX "ai_campaigns_clientAccountId_idx" ON "ai_campaigns"("clientAccountId");

-- CreateIndex
CREATE INDEX "ai_campaigns_status_idx" ON "ai_campaigns"("status");

-- CreateIndex
CREATE INDEX "ai_tasks_clientAccountId_idx" ON "ai_tasks"("clientAccountId");

-- CreateIndex
CREATE INDEX "ai_tasks_campaignId_idx" ON "ai_tasks"("campaignId");

-- CreateIndex
CREATE INDEX "ai_tasks_status_idx" ON "ai_tasks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_clientAccountId_name_key" ON "campaigns"("clientAccountId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");

-- AddForeignKey
ALTER TABLE "client_accounts" ADD CONSTRAINT "client_accounts_assignedAccountManagerId_fkey" FOREIGN KEY ("assignedAccountManagerId") REFERENCES "account_managers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertising_mandates" ADD CONSTRAINT "advertising_mandates_clientAccountId_fkey" FOREIGN KEY ("clientAccountId") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_clientAccountId_fkey" FOREIGN KEY ("clientAccountId") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_campaigns" ADD CONSTRAINT "ai_campaigns_clientAccountId_fkey" FOREIGN KEY ("clientAccountId") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_clientAccountId_fkey" FOREIGN KEY ("clientAccountId") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_tasks" ADD CONSTRAINT "ai_tasks_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ai_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
