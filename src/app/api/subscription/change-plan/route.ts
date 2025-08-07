import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const planPricing = {
  basic: { price: 99, name: "Basic" },
  pro: { price: 199, name: "Pro" },
  enterprise: { price: 399, name: "Enterprise" }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, newPlanId } = await request.json()

    if (!userId || !newPlanId) {
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

    const newPlan = planPricing[newPlanId as keyof typeof planPricing]
    if (!newPlan) {
      return NextResponse.json(
        { message: "Plan invalide" },
        { status: 400 }
      )
    }

    // Mettre à jour l'abonnement
    const updatedSubscription = await prisma.subscription.update({
      where: { clientAccountId: clientAccount.id },
      data: {
        plan: newPlanId.toUpperCase(),
        amount: newPlan.price,
        updatedAt: new Date()
      }
    })

    // Mettre à jour le plan dans le compte client
    await prisma.clientAccount.update({
      where: { id: clientAccount.id },
      data: {
        subscriptionPlan: newPlanId.toUpperCase()
      }
    })

    return NextResponse.json({
      message: "Plan changé avec succès",
      subscription: {
        id: updatedSubscription.id,
        plan: updatedSubscription.plan,
        amount: updatedSubscription.amount
      }
    })

  } catch (error) {
    console.error("Erreur lors du changement de plan:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 