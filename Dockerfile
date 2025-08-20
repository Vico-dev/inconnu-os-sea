# Dockerfile pour Inconnu OS
FROM node:20-slim AS base

# Installer les dépendances nécessaires
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Build de l'application avec gestion d'erreurs
RUN chmod +x ./build.sh && ./build.sh

# Image de production
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production

# Installer OpenSSL pour Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# Copier les fichiers nécessaires (mode next start). On copie uniquement si le build a réussi
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/start.sh ./start.sh

# Changer les permissions
RUN chown -R nextjs:nodejs /app
RUN chmod +x ./start.sh
USER nextjs

# Exposer le port
EXPOSE 3000

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

# Démarrer l'application
CMD ["./start.sh"] 