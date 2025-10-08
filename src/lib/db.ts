import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration SSL pour Railway - forcer sslmode=disable
let databaseUrl = process.env.DATABASE_URL
if (process.env.NODE_ENV === 'production' && databaseUrl) {
  // Remplacer ou ajouter sslmode=disable
  if (databaseUrl.includes('sslmode=')) {
    databaseUrl = databaseUrl.replace(/sslmode=[^&]*/, 'sslmode=disable')
  } else {
    databaseUrl = `${databaseUrl}?sslmode=disable`
  }
}

// Forcer la variable d'environnement effective utilisée par Prisma
if (process.env.NODE_ENV === 'production' && databaseUrl) {
  process.env.DATABASE_URL = databaseUrl
}

const prismaConfig = process.env.NODE_ENV === 'production' ? {
  datasources: {
    db: {
      url: databaseUrl
    }
  }
} : {}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaConfig)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Alias pour compatibilité
export const db = prisma 