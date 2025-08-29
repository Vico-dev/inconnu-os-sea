#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('📋 Liste des comptes clients :\n')
    
    const clientAccounts = await prisma.clientAccount.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        company: {
          select: {
            name: true,
            industry: true
          }
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            amount: true
          }
        }
      }
    })

    if (clientAccounts.length === 0) {
      console.log('❌ Aucun compte client trouvé')
      return
    }

    clientAccounts.forEach((account, index) => {
      console.log(`👤 Client ${index + 1}:`)
      console.log(`   ID: ${account.id}`)
      console.log(`   User ID: ${account.userId}`)
      console.log(`   Email: ${account.user.email}`)
      console.log(`   Nom: ${account.user.firstName} ${account.user.lastName}`)
      console.log(`   Rôle: ${account.user.role}`)
      console.log(`   Entreprise: ${account.company?.name || 'Non renseignée'}`)
      console.log(`   Onboarding: ${account.onboardingCompleted ? '✅ Terminé' : '❌ En cours'}`)
      console.log(`   Plan: ${account.subscriptionPlan || 'Aucun'}`)
      console.log(`   Abonnement: ${account.subscription ? `${account.subscription.plan} (${account.subscription.status})` : 'Aucun'}`)
      console.log('')
    })

    console.log('🔑 Pour créer un abonnement manuel :')
    console.log('POST /api/admin/billing/subscriptions')
    console.log('Body: { "email": "victorsoldet@gmail.com", "plan": "SMALL_BUDGET", "status": "ACTIVE" }')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 