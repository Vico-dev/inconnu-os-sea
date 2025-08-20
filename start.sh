#!/bin/bash
set -e

echo "🚀 Démarrage de l'application..."
echo "📁 Contenu du répertoire:"
ls -la

# Si le build n'existe pas (cas Railway), construire avant de démarrer
if [ ! -d ".next" ]; then
  echo "⚠️ Aucun build trouvé (.next manquant). Lancement du build..."
  echo "📦 Installation des dépendances..."
  npm ci --legacy-peer-deps
  echo "🔧 Génération Prisma..."
  npx prisma generate
  echo "🏗️ Build Next.js..."
  npm run build
  echo "✅ Build terminé. Vérification .next:"
  ls -la .next/
else
  echo "✅ Build trouvé (.next existe)"
fi

# Démarrage
echo "🚀 Lancement de Next.js..."
exec npx next start -p "${PORT:-3000}"