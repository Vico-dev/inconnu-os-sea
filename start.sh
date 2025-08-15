#!/bin/bash

# Appliquer les migrations Prisma (optionnel)
echo "🔧 Application des migrations Prisma..."
npx prisma migrate deploy || echo "⚠️ Migrations non appliquées, continuation..."

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Démarrer l'application
echo "🚀 Démarrage de l'application..."
exec node server.js 