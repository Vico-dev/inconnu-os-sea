#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [emailArg, planArg, statusArg] = process.argv.slice(2)

  if (!emailArg || !planArg) {
    console.error('Usage: tsx scripts/create-subscription.ts <email> <SMALL_BUDGET|MEDIUM_BUDGET|LARGE_BUDGET> [TRIAL|ACTIVE|SUSPENDED|CANCELLED]')
    process.exit(1)
  }

  const validPlans = ['SMALL_BUDGET', 'MEDIUM_BUDGET', 'LARGE_BUDGET'] as const
  type Plan = typeof validPlans[number]

  const plan = planArg as Plan
  if (!validPlans.includes(plan)) {
    console.error(`Plan invalide: ${planArg}. Choisir parmi: ${validPlans.join(', ')}`)
    process.exit(1)
  }

  const validStatuses = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] as const
  type SubStatus = typeof validStatuses[number]
  const status: SubStatus = (statusArg as SubStatus) || 'TRIAL'
  if (!validStatuses.includes(status)) {
    console.error(`Statut invalide: ${statusArg}. Choisir parmi: ${validStatuses.join(', ')}`)
    process.exit(1)
  }

  const planAmounts: Record<Plan, number> = {
    SMALL_BUDGET: 200,
    MEDIUM_BUDGET: 400,
    LARGE_BUDGET: 600,
  }

  console.log(`→ Recherche utilisateur: ${emailArg}`)
  const user = await prisma.user.findUnique({ where: { email: emailArg } })
  if (!user) {
    console.error('Utilisateur introuvable')
    process.exit(1)
  }

  console.log(`→ Recherche clientAccount pour userId=${user.id}`)
  const clientAccount = await prisma.clientAccount.findUnique({ where: { userId: user.id } })
  if (!clientAccount) {
    console.error("ClientAccount introuvable. L'utilisateur a-t-il complété l'onboarding ?")
    process.exit(1)
  }

  const existing = await prisma.subscription.findUnique({ where: { clientAccountId: clientAccount.id } })
  if (existing) {
    console.log('ℹ️  Une souscription existe déjà. Mise à jour du plan/statut…')
    const updated = await prisma.subscription.update({
      where: { clientAccountId: clientAccount.id },
      data: {
        plan,
        status,
        amount: planAmounts[plan],
        currency: 'EUR',
        currentPeriodStart: existing.currentPeriodStart ?? new Date(),
        currentPeriodEnd: existing.currentPeriodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    await prisma.clientAccount.update({ where: { id: clientAccount.id }, data: { subscriptionPlan: plan } })
    console.log('✅ Souscription mise à jour:', { id: updated.id, plan: updated.plan, status: updated.status })
    return
  }

  console.log('→ Création de la souscription…')
  const subscription = await prisma.subscription.create({
    data: {
      clientAccountId: clientAccount.id,
      plan,
      status,
      amount: planAmounts[plan],
      currency: 'EUR',
      trialStart: status === 'TRIAL' ? new Date() : null,
      trialEnd: status === 'TRIAL' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.clientAccount.update({ where: { id: clientAccount.id }, data: { subscriptionPlan: plan } })

  console.log('✅ Souscription créée:', { id: subscription.id, plan: subscription.plan, status: subscription.status })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})