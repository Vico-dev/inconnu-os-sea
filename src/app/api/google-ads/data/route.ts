import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      )
    }

    console.log("📊 Récupération des données Google Ads pour l'utilisateur:", userId)

    // Récupérer le compte client et ses campagnes
    const clientAccount = await prisma.clientAccount.findFirst({
      where: {
        userId,
        googleAdsConnected: true
      },
      include: {
        campaigns: {
          orderBy: {
            updatedAt: 'desc'
          }
        },
        user: {
          include: {
            googleAdsConnection: true
          }
        }
      }
    })

    if (!clientAccount) {
      return NextResponse.json(
        { error: "Aucun compte client connecté à Google Ads trouvé" },
        { status: 404 }
      )
    }

    // Calculer les métriques globales
    const campaigns = clientAccount.campaigns
    const globalMetrics = campaigns.reduce((acc, campaign) => {
      const metrics = JSON.parse(campaign.metrics || "{}")
      return {
        impressions: acc.impressions + (metrics.impressions || 0),
        clicks: acc.clicks + (metrics.clicks || 0),
        cost: acc.cost + (metrics.cost || 0),
        conversions: acc.conversions + (metrics.conversions || 0),
        campaigns: acc.campaigns + 1
      }
    }, {
      impressions: 0,
      clicks: 0,
      cost: 0,
      conversions: 0,
      campaigns: 0
    })

    // Calculer les métriques dérivées
    const ctr = globalMetrics.impressions > 0 ? (globalMetrics.clicks / globalMetrics.impressions) * 100 : 0
    const averageCpc = globalMetrics.clicks > 0 ? globalMetrics.cost / globalMetrics.clicks : 0
    const conversionRate = globalMetrics.clicks > 0 ? (globalMetrics.conversions / globalMetrics.clicks) * 100 : 0
    const roas = globalMetrics.cost > 0 ? (globalMetrics.conversions * 50) / globalMetrics.cost : 0 // Estimation du ROAS

    // Formater les campagnes pour l'affichage
    const formattedCampaigns = campaigns.map(campaign => {
      const metrics = JSON.parse(campaign.metrics || "{}")
      const campaignCtr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
      const campaignCpc = metrics.clicks > 0 ? metrics.cost / metrics.clicks : 0
      const campaignConversionRate = metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        budget: campaign.budget,
        metrics: {
          impressions: metrics.impressions || 0,
          clicks: metrics.clicks || 0,
          cost: metrics.cost || 0,
          conversions: metrics.conversions || 0,
          ctr: campaignCtr,
          averageCpc: campaignCpc,
          conversionRate: campaignConversionRate,
          lastSync: metrics.lastSync
        }
      }
    })

    // Informations de connexion
    const connection = clientAccount.user.googleAdsConnection
    const lastSync = connection?.updatedAt

    return NextResponse.json({
      success: true,
      data: {
        connection: {
          isConnected: connection?.isConnected || false,
          lastSync: lastSync?.toISOString(),
          accounts: connection?.accounts ? JSON.parse(connection.accounts) : []
        },
        globalMetrics: {
          ...globalMetrics,
          ctr: parseFloat(ctr.toFixed(2)),
          averageCpc: parseFloat(averageCpc.toFixed(2)),
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          roas: parseFloat(roas.toFixed(2))
        },
        campaigns: formattedCampaigns,
        summary: {
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'ENABLED').length,
          pausedCampaigns: campaigns.filter(c => c.status === 'PAUSED').length,
          totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
        }
      }
    })

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des données Google Ads:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de la récupération des données",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
} 