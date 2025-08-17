#!/bin/bash

# Générer Prisma Client
echo "🔧 Génération du Prisma Client..."
npx prisma generate

# Build Next.js avec gestion d'erreurs
echo "🏗️ Build de l'application Next.js..."
npx next build --no-lint

# Vérifier si le build a réussi
if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    exit 0
else
    echo "❌ Échec du build Next.js. Arrêt du déploiement pour éviter un runtime sans .next"
    exit 1
fi