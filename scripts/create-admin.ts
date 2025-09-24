#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
    return process.env.DATABASE_URL
  }
  const host = process.env.PGHOST
  const port = process.env.PGPORT
  const user = process.env.PGUSER
  const password = process.env.PGPASSWORD
  const db = process.env.PGDATABASE
  if (host && port && user && password && db) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${db}?sslmode=require`
  }
  return undefined
}

const dbUrl = resolveDatabaseUrl()
const prisma = dbUrl ? new PrismaClient({ datasources: { db: { url: dbUrl } } }) : new PrismaClient()

async function main() {
  const emailArg = process.argv[2]
  const passwordArg = process.argv[3]

  if (!emailArg) {
    console.error('Usage: tsx scripts/create-admin.ts <email> [password]')
    process.exit(1)
  }

  const email = emailArg.toLowerCase()
  const tempPassword = passwordArg || Math.random().toString(36).slice(2) + 'A!9'

  try {
    console.log(`🔎 Recherche de l'utilisateur ${email}...`)
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      console.log('✅ Utilisateur trouvé, mise à jour du rôle → ADMIN et validation email')
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          emailVerified: existing.emailVerified || new Date(),
          isActive: true,
        }
      })
      console.log('✅ OK:', { id: updated.id, email: updated.email, role: updated.role })
      return
    }

    console.log('➕ Utilisateur introuvable, création d\'un nouvel ADMIN...')
    const hashed = await bcrypt.hash(tempPassword, 12)
    const created = await prisma.user.create({
      data: {
        email,
        password: hashed,
        firstName: 'Victor',
        lastName: 'Admin',
        role: 'ADMIN',
        emailVerified: new Date(),
        isActive: true,
      }
    })
    console.log('✅ Administrateur créé:', { id: created.id, email: created.email, role: created.role })
    console.log('🔑 Mot de passe temporaire:', tempPassword)
  } catch (error) {
    console.error('❌ Erreur création/mise à jour ADMIN:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


