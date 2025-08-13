import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur a un compte client
    const clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: session.user.id }
    })

    if (!clientAccount) {
      return NextResponse.json(
        { error: "Compte client non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier les permissions Google Ads
    const permission = await prisma.googleAdsPermission.findFirst({
      where: {
        clientAccountId: clientAccount.id,
        isActive: true
      }
    })

    if (!permission) {
      return NextResponse.json(
        { error: "Aucune permission Google Ads active" },
        { status: 403 }
      )
    }

    // TODO: Récupérer les vraies données Google Ads
    // Pour l'instant, retourner des données de test
    const testData = {
      campaigns: [
        {
          id: "test-campaign-1",
          name: "Campagne Test - Mots-clés génériques",
          status: "ACTIVE",
          impressions: 15420,
          clicks: 342,
          cost: 1250.50,
          conversions: 28,
          ctr: 2.22,
          cpc: 3.66,
          cpm: 81.10
        },
        {
          id: "test-campaign-2", 
          name: "Campagne Test - Marque",
          status: "ACTIVE",
          impressions: 8920,
          clicks: 156,
          cost: 890.25,
          conversions: 12,
          ctr: 1.75,
          cpc: 5.71,
          cpm: 99.80
        },
        {
          id: "test-campaign-3",
          name: "Campagne Test - Remarketing",
          status: "PAUSED",
          impressions: 5430,
          clicks: 89,
          cost: 445.75,
          conversions: 8,
          ctr: 1.64,
          cpc: 5.01,
          cpm: 82.09
        }
      ],
      metrics: {
        totalImpressions: 29770,
        totalClicks: 587,
        totalCost: 2586.50,
        totalConversions: 48,
        averageCtr: 1.97,
        averageCpc: 4.41,
        averageCpm: 86.89,
        totalCampaigns: 3,
        activeCampaigns: 2
      }
    }

    return NextResponse.json({
      success: true,
      data: testData,
      message: "Données de test - Connexion Google Ads en cours de configuration"
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des données Google Ads:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    )
  }
} 