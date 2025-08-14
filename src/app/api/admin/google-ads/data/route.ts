import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    // Récupérer la connexion MCC de l'admin
    const mccConnection = await prisma.googleAdsConnection.findFirst({
      where: {
        userId: session.user.id,
        isConnected: true
      }
    })

    if (!mccConnection) {
      return NextResponse.json(
        { error: "Connexion MCC non établie" },
        { status: 403 }
      )
    }

    // Vérifier si le token est expiré et le rafraîchir si nécessaire
    let accessToken = mccConnection.accessToken
    if (mccConnection.tokenExpiry && new Date() > mccConnection.tokenExpiry) {
      try {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
            refresh_token: mccConnection.refreshToken!,
            grant_type: 'refresh_token',
          }),
        })

        const refreshData = await refreshResponse.json()
        if (refreshResponse.ok) {
          accessToken = refreshData.access_token
          
          // Mettre à jour le token dans la base
          await prisma.googleAdsConnection.update({
            where: { id: mccConnection.id },
            data: {
              accessToken: refreshData.access_token,
              tokenExpiry: new Date(Date.now() + refreshData.expires_in * 1000),
            }
          })
        } else {
          throw new Error('Échec du rafraîchissement du token')
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error)
        return NextResponse.json(
          { error: "Session MCC expirée" },
          { status: 401 }
        )
      }
    }

    // Récupérer tous les comptes clients du MCC
    const accountsResponse = await fetch('https://googleads.googleapis.com/v14/customers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
    })

    if (!accountsResponse.ok) {
      const errorData = await accountsResponse.json()
      console.error('Erreur API Google Ads:', errorData)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des comptes MCC" },
        { status: 500 }
      )
    }

    const accountsData = await accountsResponse.json()
    
    // Récupérer les données pour chaque compte client
    const allCampaigns = []
    const allMetrics = {
      totalImpressions: 0,
      totalClicks: 0,
      totalCost: 0,
      totalConversions: 0,
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalAccounts: 0
    }

    for (const account of accountsData.results || []) {
      const customerId = account.customer.id
      
      try {
        // Récupérer les campagnes pour ce compte
        const campaignsResponse = await fetch(
          `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:searchStream`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                SELECT 
                  campaign.id,
                  campaign.name,
                  campaign.status,
                  metrics.impressions,
                  metrics.clicks,
                  metrics.cost_micros,
                  metrics.conversions,
                  metrics.average_cpc,
                  metrics.ctr,
                  metrics.average_cpm
                FROM campaign 
                WHERE segments.date DURING LAST_30_DAYS
              `
            })
          }
        )

        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json()
          
          const campaigns = campaignsData.results?.map((row: any) => ({
            customerId: customerId,
            customerName: account.customer.descriptiveName || account.customer.name,
            id: row.campaign?.id || 'unknown',
            name: row.campaign?.name || 'Campagne sans nom',
            status: row.campaign?.status || 'UNKNOWN',
            impressions: parseInt(row.metrics?.impressions || '0'),
            clicks: parseInt(row.metrics?.clicks || '0'),
            cost: parseFloat(row.metrics?.cost_micros || '0') / 1000000,
            conversions: parseFloat(row.metrics?.conversions || '0'),
            ctr: parseFloat(row.metrics?.ctr || '0') * 100,
            cpc: parseFloat(row.metrics?.average_cpc || '0') / 1000000,
            cpm: parseFloat(row.metrics?.average_cpm || '0') / 1000000
          })) || []

          allCampaigns.push(...campaigns)
          
          // Mettre à jour les métriques globales
          allMetrics.totalImpressions += campaigns.reduce((sum: number, c: any) => sum + c.impressions, 0)
          allMetrics.totalClicks += campaigns.reduce((sum: number, c: any) => sum + c.clicks, 0)
          allMetrics.totalCost += campaigns.reduce((sum: number, c: any) => sum + c.cost, 0)
          allMetrics.totalConversions += campaigns.reduce((sum: number, c: any) => sum + c.conversions, 0)
          allMetrics.totalCampaigns += campaigns.length
          allMetrics.activeCampaigns += campaigns.filter((c: any) => c.status === 'ENABLED').length
          allMetrics.totalAccounts++
        }
      } catch (error) {
        console.error(`Erreur pour le compte ${customerId}:`, error)
        // Continuer avec les autres comptes
      }
    }

    // Calculer les moyennes
    if (allMetrics.totalCampaigns > 0) {
      allMetrics.averageCtr = allCampaigns.reduce((sum: number, c: any) => sum + c.ctr, 0) / allMetrics.totalCampaigns
      allMetrics.averageCpc = allCampaigns.reduce((sum: number, c: any) => sum + c.cpc, 0) / allMetrics.totalCampaigns
      allMetrics.averageCpm = allCampaigns.reduce((sum: number, c: any) => sum + c.cpm, 0) / allMetrics.totalCampaigns
    }

    return NextResponse.json({
      success: true,
      data: { 
        campaigns: allCampaigns, 
        metrics: allMetrics,
        accounts: accountsData.results?.length || 0
      },
      message: "Données MCC Google Ads récupérées avec succès"
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des données MCC:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données MCC" },
      { status: 500 }
    )
  }
} 