#!/bin/bash
set -e

attempt_build() {
  echo "⚠️ Aucun build valide trouvé. Lancement du build..."
  # Générer Prisma si le client n'existe pas (robustesse)
  if [ ! -d "node_modules/.prisma/client" ]; then
    echo "🔧 Prisma client absent. Génération..."
    npx prisma generate
  fi
  echo "🏗️ Build Next.js..."
  npm run build
}

is_build_valid() {
  [ -d ".next" ] && [ -f ".next/BUILD_ID" ]
}

echo "🚀 Démarrage de l'application..."
echo "📁 Contenu du répertoire:"
ls -la

# Validation du build
if ! is_build_valid; then
  attempt_build
fi

if ! is_build_valid; then
  echo "❌ Build toujours invalide après tentative. Arrêt."
  exit 1
fi

echo "✅ Build valide détecté (.next/BUILD_ID)"

# Démarrage
echo "🚀 Lancement de Next.js..."
exec npx next start -p "${PORT:-3000}" -H 0.0.0.0