import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { message: "Utilisateur non identifié" },
        { status: 401 }
      )
    }

    // Récupérer le compte client avec l&apos;abonnement
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { userId: userId },
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

    // Vérifier si l&apos;abonnement est actif
    const hasActiveSubscription = clientAccount.subscription && 
      (clientAccount.subscription.status === "ACTIVE" || 
       clientAccount.subscription.status === "TRIAL")

    return NextResponse.json({
      hasActiveSubscription,
      subscription: clientAccount.subscription,
      company: clientAccount.company
    })

  } catch (error) {
    console.error("Erreur lors de la vérification de l&apos;abonnement:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 