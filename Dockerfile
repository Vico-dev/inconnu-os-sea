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

# Build de l'application
RUN npm run build

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

# Copier les fichiers nécessaires
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/node_modules ./node_modules

# Changer les permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposer le port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Démarrer l'application
CMD ["node", "server.js"] 