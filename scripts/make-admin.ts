#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  const email = 'victorsoldet@gmail.com'
  
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
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin() 