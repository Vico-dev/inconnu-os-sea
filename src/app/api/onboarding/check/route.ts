import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // TODO: Récupérer l'utilisateur depuis la session NextAuth
    // Pour l'instant, on utilise un paramètre pour simuler
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { message: "Utilisateur non identifié" },
        { status: 401 }
      )
    }

    // Récupérer le compte client avec l'abonnement
    const clientAccount = await prisma.clientAccount.findUnique({
      where: {
        userId: userId
      },
      include: {
        subscription: true,
        company: true
      }
    })

    if (!clientAccount) {
      return NextResponse.json(
        { message: "Compte client non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier si l'onboarding est terminé
    const onboardingCompleted = clientAccount.onboardingCompleted || false

    // Vérifier si l'abonnement est actif
    const hasActiveSubscription = clientAccount.subscription && 
      (clientAccount.subscription.status === "ACTIVE" || 
       clientAccount.subscription.status === "TRIAL")

    return NextResponse.json({
      onboardingCompleted,
      hasActiveSubscription,
      companyName: clientAccount.company?.name,
      industry: clientAccount.company?.industry,
      subscription: clientAccount.subscription
    })

  } catch (error) {
    console.error("Erreur lors de la vérification de l'onboarding:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 