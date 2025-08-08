import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientAccountId, plan } = body

    // Validation du plan
    const validPlans = ['SMALL_BUDGET', 'MEDIUM_BUDGET', 'LARGE_BUDGET']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      )
    }

    // Définir le montant selon le plan
    const planAmounts = {
      SMALL_BUDGET: 200,
      MEDIUM_BUDGET: 400,
      LARGE_BUDGET: 600
    }

    const amount = planAmounts[plan as keyof typeof planAmounts]

    // Vérifier si une souscription existe déjà
    const existingSubscription = await prisma.subscription.findUnique({
      where: { clientAccountId }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Une souscription existe déjà pour ce compte' },
        { status: 400 }
      )
    }

    // Créer la souscription
    const subscription = await prisma.subscription.create({
      data: {
        clientAccountId,
        plan,
        status: 'TRIAL',
        amount,
        currency: 'EUR',
        trialStart: new Date(),
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      }
    })

    // Mettre à jour le compte client
    await prisma.clientAccount.update({
      where: { id: clientAccountId },
      data: {
        subscriptionPlan: plan
      }
    })

    return NextResponse.json({
      message: 'Souscription créée avec succès',
      subscription
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création de la souscription:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 