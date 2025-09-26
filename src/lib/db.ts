import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration SSL pour Railway
const prismaConfig = process.env.NODE_ENV === 'production' ? {
  datasources: {
    db: {
      url: process.env.DATABASE_URL?.replace('sslmode=require', 'sslmode=disable')
    }
  }
} : {}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaConfig)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Alias pour compatibilité
export const db = prisma 