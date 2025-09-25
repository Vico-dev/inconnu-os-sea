#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  const argEmail = process.argv[2]
  const envEmail = process.env.EMAIL
  const email = argEmail || envEmail

  if (!email) {
    console.error('❌ Veuillez fournir un email: npx tsx scripts/make-admin.ts "email@example.com"')
    process.exit(1)
  }
  
  try {
    console.log(`🔄 Attribution du rôle ADMIN à ${email}...`)
    
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    
    console.log('✅ Utilisateur mis à jour:', {
      email: user.email,
      role: user.role,
      id: user.id
    })
    
  } catch (error: any) {
    if (error?.code === 'P2025') {
      console.error(`❌ Utilisateur introuvable pour l'email: ${email}. Créez d'abord l'utilisateur puis relancez.`)
    } else {
      console.error('❌ Erreur:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin() 