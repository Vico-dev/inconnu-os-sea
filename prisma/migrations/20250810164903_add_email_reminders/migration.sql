-- CreateTable
CREATE TABLE "email_reminders" (
    "id" TEXT NOT NULL,
    "clientAccountId" TEXT NOT NULL,
    "reminderType" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_reminders_clientAccountId_reminderType_key" ON "email_reminders"("clientAccountId", "reminderType");

-- AddForeignKey
ALTER TABLE "email_reminders" ADD CONSTRAINT "email_reminders_clientAccountId_fkey" FOREIGN KEY ("clientAccountId") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
