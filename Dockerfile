FROM node:20-slim

# Dépendances système nécessaires (OpenSSL pour Prisma)
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les fichiers de dépendances et Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le code source
COPY . .

# Générer Prisma Client
RUN npx prisma generate

# Build de l'application Next.js
RUN npm run build

# Variables d'environnement/runtime
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]