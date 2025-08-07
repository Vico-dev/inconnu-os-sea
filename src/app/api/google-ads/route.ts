import { NextRequest, NextResponse } from "next/server"
import { GoogleAdsApi } from "google-ads-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")
    const refreshToken = searchParams.get("refreshToken")

    if (!customerId || !refreshToken) {
      return NextResponse.json(
        { error: "Customer ID et Refresh Token requis" },
        { status: 400 }
      )
    }

    // Configuration Google Ads API
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    })

    const customer = client.Customer({
      customer_id: customerId,
      refresh_token: refreshToken,
    })

    // Récupération des métriques de base
    const query = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.average_cpc
      FROM campaign 
      WHERE campaign.status IN ('ENABLED', 'PAUSED')
      ORDER BY metrics.impressions DESC
    `

    const response = await customer.query(query)

    const campaigns = response.map((row: any) => ({
      id: row.campaign.id,
      name: row.campaign.name,
      status: row.campaign.status,
      impressions: parseInt(row.metrics.impressions),
      clicks: parseInt(row.metrics.clicks),
      cost: parseFloat(row.metrics.cost_micros) / 1000000,
      conversions: parseFloat(row.metrics.conversions),
      averageCpc: parseFloat(row.metrics.average_cpc) / 1000000,
    }))

    return NextResponse.json({
      success: true,
      data: campaigns,
    })
  } catch (error) {
    console.error("Erreur Google Ads API:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données Google Ads" },
      { status: 500 }
    )
  }
} 