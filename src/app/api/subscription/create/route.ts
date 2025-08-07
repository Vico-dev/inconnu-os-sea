import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const planPricing = {
  basic: { price: 99, name: "Basic" },
  pro: { price: 199, name: "Pro" },
  enterprise: { price: 399, name: "Enterprise" }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, planId } = await request.json()

    if (!userId || !planId) {
      return NextResponse.json(
        { message: "Données manquantes" },
        { status: 400 }
      )
    }

    // Récupérer le compte client
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { userId: userId },
      include: {
        subscription: true
      }
    })

    if (!clientAccount) {
      return NextResponse.json(
        { message: "Compte client non trouvé" },
        { status: 404 }
      )
    }

    const plan = planPricing[planId as keyof typeof planPricing]
    if (!plan) {
      return NextResponse.json(
        { message: "Plan invalide" },
        { status: 400 }
      )
    }

    // Mettre à jour ou créer l'abonnement (en mode TRIAL)
    let subscription
    if (clientAccount.subscription) {
      // Mettre à jour l'abonnement existant
      subscription = await prisma.subscription.update({
        where: { clientAccountId: clientAccount.id },
        data: {
          plan: planId.toUpperCase(),
          status: "TRIAL", // Commence par un essai
          amount: plan.price,
          trialStart: new Date(),
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 jours
        }
      })
    } else {
      // Créer un nouvel abonnement
      subscription = await prisma.subscription.create({
        data: {
          clientAccountId: clientAccount.id,
          plan: planId.toUpperCase(),
          status: "TRIAL",
          amount: plan.price,
          currency: "EUR",
          trialStart: new Date(),
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 jours
        }
      })
    }

    // Mettre à jour le plan dans le compte client
    await prisma.clientAccount.update({
      where: { id: clientAccount.id },
      data: {
        subscriptionPlan: planId.toUpperCase()
      }
    })

    return NextResponse.json({
      message: "Abonnement d'essai créé avec succès",
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        trialEnd: subscription.trialEnd
      }
    })

  } catch (error) {
    console.error("Erreur lors de la création de l'abonnement:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 