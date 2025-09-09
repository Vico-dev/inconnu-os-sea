-- Ajouter la colonne loyaltyLevel et mettre à jour la contrainte unique

ALTER TABLE "member_prices"
ADD COLUMN IF NOT EXISTS "loyaltyLevel" TEXT NOT NULL DEFAULT 'MEMBER';

-- Supprimer l'ancien unique index s'il existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'member_prices_client_gtin_country_unique'
  ) THEN
    DROP INDEX "member_prices_client_gtin_country_unique";
  END IF;
END $$;

-- Créer le nouvel unique index incluant loyaltyLevel
CREATE UNIQUE INDEX IF NOT EXISTS "member_prices_client_gtin_country_level_unique"
ON "member_prices" ("clientAccountId", "gtin", "country", "loyaltyLevel");

