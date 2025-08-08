import { NextRequest, NextResponse } from "next/server"
import { GoogleAdsApi } from "google-ads-api"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur requis" },
        { status: 400 }
      )
    }

    console.log("🔄 Début de la synchronisation Google Ads pour l&apos;utilisateur:", userId)

    // Récupérer la connexion Google Ads de l&apos;utilisateur
    const connection = await prisma.googleAdsConnection.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            clientAccount: true
          }
        }
      }
    })

    if (!connection || !connection.isConnected) {
      return NextResponse.json(
        { error: "Aucune connexion Google Ads active trouvée" },
        { status: 404 }
      )
    }

    // Configuration Google Ads API
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    })

    // Récupérer les comptes Google Ads accessibles
    const accounts = JSON.parse(connection.accounts || "[]")
    
    if (accounts.length === 0) {
      return NextResponse.json(
        { error: "Aucun compte Google Ads accessible" },
        { status: 404 }
      )
    }

    // Utiliser le premier compte (on peut améliorer pour gérer plusieurs comptes)
    const customerId = accounts[0].customerId || accounts[0].id

    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: connection.refreshToken!,
    })

    console.log("📊 Récupération des campagnes pour le compte:", customerId)

    // Récupération des campagnes avec métriques
    const campaignQuery = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.start_date,
        campaign.end_date,
        campaign.budget_amount_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.average_cpc,
        metrics.ctr,
        metrics.average_cpm,
        metrics.conversions_from_interactions_rate
      FROM campaign 
      WHERE campaign.status IN ('ENABLED', 'PAUSED')
      ORDER BY metrics.impressions DESC
    `

    const campaignResponse = await customer.query(campaignQuery)
    console.log("✅ Campagnes trouvées:", campaignResponse.length)

    // Récupération des métriques globales
    const metricsQuery = `
      SELECT 
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.average_cpc,
        metrics.ctr,
        metrics.average_cpm,
        metrics.conversions_from_interactions_rate
      FROM customer 
      WHERE segments.date DURING LAST_30_DAYS
    `

    let globalMetrics = null
    try {
      const metricsResponse = await customer.query(metricsQuery)
      if (metricsResponse.length > 0) {
        globalMetrics = metricsResponse[0]
      }
    } catch (error) {
      console.log("⚠️ Impossible de récupérer les métriques globales:", error)
    }

    // Synchroniser les campagnes en base de données
    const syncedCampaigns = []
    
    for (const row of campaignResponse) {
      const campaignData = {
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        channelType: row.campaign.advertising_channel_type,
        startDate: row.campaign.start_date,
        endDate: row.campaign.end_date,
        budget: row.campaign.budget_amount_micros ? parseFloat(row.campaign.budget_amount_micros) / 1000000 : null,
        impressions: parseInt(row.metrics.impressions || "0"),
        clicks: parseInt(row.metrics.clicks || "0"),
        cost: parseFloat(row.metrics.cost_micros || "0") / 1000000,
        conversions: parseFloat(row.metrics.conversions || "0"),
        averageCpc: parseFloat(row.metrics.average_cpc || "0") / 1000000,
        ctr: parseFloat(row.metrics.ctr || "0"),
        averageCpm: parseFloat(row.metrics.average_cpm || "0") / 1000000,
        conversionRate: parseFloat(row.metrics.conversions_from_interactions_rate || "0")
      }

      // Upsert la campagne en base
      const campaign = await prisma.campaign.upsert({
        where: {
          id: campaignData.id
        },
        update: {
          name: campaignData.name,
          status: campaignData.status,
          budget: campaignData.budget,
          metrics: JSON.stringify({
            impressions: campaignData.impressions,
            clicks: campaignData.clicks,
            cost: campaignData.cost,
            conversions: campaignData.conversions,
            averageCpc: campaignData.averageCpc,
            ctr: campaignData.ctr,
            averageCpm: campaignData.averageCpm,
            conversionRate: campaignData.conversionRate,
            lastSync: new Date().toISOString()
          })
        },
        create: {
          id: campaignData.id,
          clientAccountId: connection.user.clientAccount!.id,
          name: campaignData.name,
          status: campaignData.status,
          budget: campaignData.budget,
          metrics: JSON.stringify({
            impressions: campaignData.impressions,
            clicks: campaignData.clicks,
            cost: campaignData.cost,
            conversions: campaignData.conversions,
            averageCpc: campaignData.averageCpc,
            ctr: campaignData.ctr,
            averageCpm: campaignData.averageCpm,
            conversionRate: campaignData.conversionRate,
            lastSync: new Date().toISOString()
          })
        }
      })

      syncedCampaigns.push(campaign)
    }

    // Mettre à jour la date de dernière synchronisation
    await prisma.googleAdsConnection.update({
      where: { userId },
      data: {
        updatedAt: new Date()
      }
    })

    console.log("✅ Synchronisation terminée. Campagnes synchronisées:", syncedCampaigns.length)

    return NextResponse.json({
      success: true,
      message: "Synchronisation terminée avec succès",
      data: {
        campaignsCount: syncedCampaigns.length,
        globalMetrics: globalMetrics ? {
          impressions: parseInt(globalMetrics.metrics.impressions || "0"),
          clicks: parseInt(globalMetrics.metrics.clicks || "0"),
          cost: parseFloat(globalMetrics.metrics.cost_micros || "0") / 1000000,
          conversions: parseFloat(globalMetrics.metrics.conversions || "0"),
          averageCpc: parseFloat(globalMetrics.metrics.average_cpc || "0") / 1000000,
          ctr: parseFloat(globalMetrics.metrics.ctr || "0"),
          averageCpm: parseFloat(globalMetrics.metrics.average_cpm || "0") / 1000000,
          conversionRate: parseFloat(globalMetrics.metrics.conversions_from_interactions_rate || "0")
        } : null,
        lastSync: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation Google Ads:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de la synchronisation",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
} 