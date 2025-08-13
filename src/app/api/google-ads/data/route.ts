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

    // Récupérer la connexion Google Ads
    const connection = await prisma.googleAdsConnection.findFirst({
      where: { userId: session.user.id }
    })

    if (!connection || !connection.isConnected) {
      return NextResponse.json(
        { error: "Connexion Google Ads non établie. Veuillez vous connecter d'abord." },
        { status: 403 }
      )
    }

    // Vérifier si le token est expiré et le rafraîchir si nécessaire
    let accessToken = connection.accessToken
    if (connection.tokenExpiry && new Date() > connection.tokenExpiry) {
      try {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
            refresh_token: connection.refreshToken!,
            grant_type: 'refresh_token',
          }),
        })

        const refreshData = await refreshResponse.json()
        if (refreshResponse.ok) {
          accessToken = refreshData.access_token
          
          // Mettre à jour le token dans la base
          await prisma.googleAdsConnection.update({
            where: { id: connection.id },
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
          { error: "Session Google Ads expirée. Veuillez vous reconnecter." },
          { status: 401 }
        )
      }
    }

    // Récupérer les campagnes Google Ads
    const campaignsResponse = await fetch(
      `https://googleads.googleapis.com/v14/customers/${permission.googleAdsCustomerId}/googleAds:searchStream`,
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

    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json()
      console.error('Erreur API Google Ads:', errorData)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des campagnes Google Ads" },
        { status: 500 }
      )
    }

    const campaignsData = await campaignsResponse.json()
    
    // Traiter les données des campagnes
    const campaigns = campaignsData.results?.map((row: any) => ({
      id: row.campaign?.id || 'unknown',
      name: row.campaign?.name || 'Campagne sans nom',
      status: row.campaign?.status || 'UNKNOWN',
      impressions: parseInt(row.metrics?.impressions || '0'),
      clicks: parseInt(row.metrics?.clicks || '0'),
      cost: parseFloat(row.metrics?.cost_micros || '0') / 1000000, // Convertir micros en euros
      conversions: parseFloat(row.metrics?.conversions || '0'),
      ctr: parseFloat(row.metrics?.ctr || '0') * 100, // Convertir en pourcentage
      cpc: parseFloat(row.metrics?.average_cpc || '0') / 1000000,
      cpm: parseFloat(row.metrics?.average_cpm || '0') / 1000000
    })) || []

    // Calculer les métriques globales
    const metrics = {
      totalImpressions: campaigns.reduce((sum: number, c: any) => sum + c.impressions, 0),
      totalClicks: campaigns.reduce((sum: number, c: any) => sum + c.clicks, 0),
      totalCost: campaigns.reduce((sum: number, c: any) => sum + c.cost, 0),
      totalConversions: campaigns.reduce((sum: number, c: any) => sum + c.conversions, 0),
      averageCtr: campaigns.length > 0 ? campaigns.reduce((sum: number, c: any) => sum + c.ctr, 0) / campaigns.length : 0,
      averageCpc: campaigns.length > 0 ? campaigns.reduce((sum: number, c: any) => sum + c.cpc, 0) / campaigns.length : 0,
      averageCpm: campaigns.length > 0 ? campaigns.reduce((sum: number, c: any) => sum + c.cpm, 0) / campaigns.length : 0,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: any) => c.status === 'ENABLED').length
    }

    return NextResponse.json({
      success: true,
      data: { campaigns, metrics },
      message: "Données Google Ads récupérées avec succès"
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des données Google Ads:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    )
  }
} 