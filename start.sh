#!/bin/bash

# Appliquer les migrations Prisma
echo "🔧 Application des migrations Prisma..."
npx prisma migrate deploy

# Vérifier si les migrations ont été appliquées avec succès
if [ $? -eq 0 ]; then
    echo "✅ Migrations appliquées avec succès"
else
    echo "❌ Erreur lors de l'application des migrations"
    exit 1
fi

# Démarrer l'application
echo "🚀 Démarrage de l'application..."
exec node server.js 