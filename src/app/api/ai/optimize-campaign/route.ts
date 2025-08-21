import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { aiGoogleAdsService } from "@/lib/ai-google-ads-service"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { campaignId } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { error: "ID de campagne manquant" },
        { status: 400 }
      )
    }

    console.log("🤖 Optimisation automatique de campagne:", {
      userId: session.user.id,
      campaignId
    })

    // Lancer l'optimisation automatique
    const optimizations = await aiGoogleAdsService.optimizeCampaign(session.user.id, campaignId)

    return NextResponse.json({
      success: true,
      optimizations,
      message: "Optimisation automatique terminée"
    })

  } catch (error) {
    console.error("❌ Erreur optimisation IA:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'optimisation" },
      { status: 500 }
    )
  }
} 