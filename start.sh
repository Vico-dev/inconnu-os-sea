#!/bin/bash
set -e

echo "🚀 Démarrage de l'application..."

# Si le build n'existe pas (cas Railway), construire avant de démarrer
if [ ! -d ".next" ]; then
  echo "⚠️ Aucun build trouvé (.next manquant). Lancement du build..."
  npm run build
fi

# Démarrage
exec npx next start -p "${PORT:-3000}"