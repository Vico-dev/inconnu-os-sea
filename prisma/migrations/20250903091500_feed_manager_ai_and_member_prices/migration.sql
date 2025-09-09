-- Feed Manager: Optimisations produits (titres/descriptions IA)
CREATE TABLE "product_optimizations" (
    "id" TEXT NOT NULL,
    "clientAccountId" TEXT NOT NULL,
    "gtin" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "originalTitle" TEXT,
    "originalDescription" TEXT,
    "originalPublicPrice" DOUBLE PRECISION,
    "originalCurrency" TEXT DEFAULT 'EUR',
    "aiTitle" TEXT,
    "aiDescription" TEXT,
    "aiPublicPrice" DOUBLE PRECISION,
    "aiMeta" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "source" TEXT NOT NULL DEFAULT 'AI',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_optimizations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_optimizations_clientAccountId_idx" ON "product_optimizations" ("clientAccountId");
CREATE INDEX "product_optimizations_gtin_idx" ON "product_optimizations" ("gtin");
CREATE UNIQUE INDEX "product_optimizations_client_gtin_lang_unique" ON "product_optimizations" ("clientAccountId", "gtin", "language");

ALTER TABLE "product_optimizations" ADD CONSTRAINT "product_optimizations_clientAccountId_fkey" FOREIGN KEY ("clientAccountId") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Feed Manager: Prix membres (loyalty_program)
CREATE TABLE "member_prices" (
    "id" TEXT NOT NULL,
    "clientAccountId" TEXT NOT NULL,
    "gtin" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'FR',
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "publicPrice" DOUBLE PRECISION NOT NULL,
    "memberPrice" DOUBLE PRECISION NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'CSV',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_prices_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "member_prices_clientAccountId_idx" ON "member_prices" ("clientAccountId");
CREATE INDEX "member_prices_gtin_idx" ON "member_prices" ("gtin");
CREATE UNIQUE INDEX "member_prices_client_gtin_country_unique" ON "member_prices" ("clientAccountId", "gtin", "country");

ALTER TABLE "member_prices" ADD CONSTRAINT "member_prices_clientAccountId_fkey" FOREIGN KEY ("clientAccountId") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Feed Manager: Imports CSV (jobs & items)
CREATE TABLE "csv_import_jobs" (
    "id" TEXT NOT NULL,
    "clientAccountId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "summary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "csv_import_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "csv_import_jobs_clientAccountId_idx" ON "csv_import_jobs" ("clientAccountId");

ALTER TABLE "csv_import_jobs" ADD CONSTRAINT "csv_import_jobs_clientAccountId_fkey" FOREIGN KEY ("clientAccountId") REFERENCES "client_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE "csv_import_items" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "gtin" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "publicPrice" DOUBLE PRECISION,
    "memberPrice" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'EUR',
    "country" TEXT DEFAULT 'FR',
    "errors" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "csv_import_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "csv_import_items_jobId_idx" ON "csv_import_items" ("jobId");
CREATE INDEX "csv_import_items_gtin_idx" ON "csv_import_items" ("gtin");

ALTER TABLE "csv_import_items" ADD CONSTRAINT "csv_import_items_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "csv_import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

