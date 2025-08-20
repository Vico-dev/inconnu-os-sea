#!/bin/bash
set -e

echo "🚀 Démarrage de l'application..."
echo "📁 Contenu du répertoire:"
ls -la

# Si le build n'existe pas (cas Railway), construire avant de démarrer
if [ ! -d ".next" ]; then
  echo "⚠️ Aucun build trouvé (.next manquant). Lancement du build..."
  # Générer Prisma si le client n'existe pas (robustesse Nixpacks)
  if [ ! -d "node_modules/.prisma/client" ]; then
    echo "🔧 Prisma client absent. Génération..."
    npx prisma generate
  fi
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