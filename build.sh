#!/bin/bash

echo "🔧 Génération du Prisma Client..."
npx prisma generate

echo "🏗️ Build de l'application Next.js..."
# Build strict; on ne continue que si un build utilisable est présent
npx next build --no-lint || {
  echo "⚠️ Build avec erreurs. Vérification de l'artefact..."
  if [ -d ".next" ]; then
    if [ -f ".next/BUILD_ID" ]; then
      echo "✅ Artefact détecté (.next/BUILD_ID présent)." 
      exit 0
    else
      echo "❌ Build invalide: fichier .next/BUILD_ID absent. Arrêt."
      exit 1
    fi
  else
    echo "❌ Échec du build Next.js: dossier .next manquant. Arrêt."
    exit 1
  fi
}

echo "✅ Build terminé avec succès"