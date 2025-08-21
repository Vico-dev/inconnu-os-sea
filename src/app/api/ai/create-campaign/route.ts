import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { aiGoogleAdsService, CampaignData } from "@/lib/ai-google-ads-service"

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

    const campaignData: CampaignData = await request.json()

    // Validation des données
    if (!campaignData.name || !campaignData.budget || !campaignData.type) {
      return NextResponse.json(
        { error: "Données de campagne manquantes" },
        { status: 400 }
      )
    }

    console.log("🤖 Création de campagne avec IA:", {
      userId: session.user.id,
      campaignType: campaignData.type,
      budget: campaignData.budget
    })

    let campaign

    // Créer la campagne selon le type
    switch (campaignData.type) {
      case 'SEARCH':
        campaign = await aiGoogleAdsService.createSearchCampaign(session.user.id, campaignData)
        break
        
      case 'SHOPPING':
        campaign = await aiGoogleAdsService.createShoppingCampaign(session.user.id, campaignData)
        break
        
      case 'PMAX':
        campaign = await aiGoogleAdsService.createPMaxCampaign(session.user.id, campaignData)
        break
        
      default:
        return NextResponse.json(
          { error: "Type de campagne non supporté" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      campaign,
      message: `Campagne ${campaignData.type} créée avec succès par l'IA`
    })

  } catch (error) {
    console.error("❌ Erreur création campagne IA:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la campagne" },
      { status: 500 }
    )
  }
} 