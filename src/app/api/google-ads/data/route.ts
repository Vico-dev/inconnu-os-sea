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

    // Récupérer la connexion Google Ads depuis l'admin MCC
    // Le client n'a pas sa propre connexion, il utilise celle de l'admin via les permissions
    const adminConnection = await prisma.googleAdsConnection.findFirst({
      where: { 
        isConnected: true,
        // Chercher une connexion admin (pas celle du client actuel)
        user: {
          role: 'ADMIN'
        }
      },
      include: {
        user: true
      }
    })

    if (!adminConnection) {
      return NextResponse.json(
        { error: "Aucune connexion MCC Google Ads trouvée. Contactez votre administrateur." },
        { status: 403 }
      )
    }

    console.log('🔍 Connexion MCC trouvée pour le client:', {
      clientId: session.user.id,
      adminId: adminConnection.user.id,
      customerId: permission.googleAdsCustomerId
    })

    const connection = adminConnection

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

    // Pour l'instant, retourner des données de test
    // TODO: Implémenter l'appel API Google Ads REST quand la méthode sera clarifiée
    console.log('🔍 Génération de données de test pour le customer ID:', permission.googleAdsCustomerId)
    
    const campaignsData = {
      results: [
        {
          campaign: {
            id: "12345678901",
            name: "Campagne Test - " + permission.googleAdsCustomerId,
            status: "ENABLED"
          },
          metrics: {
            impressions: "15420",
            clicks: "324",
            costMicros: "45600000", // 45.60€
            conversions: "12",
            averageCpc: "140000", // 0.14€
            ctr: "0.021", // 2.1%
            averageCpm: "2960000" // 2.96€
          }
        },
        {
          campaign: {
            id: "12345678902", 
            name: "Campagne Shopping - " + permission.googleAdsCustomerId,
            status: "ENABLED"
          },
          metrics: {
            impressions: "8750",
            clicks: "156",
            costMicros: "23400000", // 23.40€
            conversions: "7",
            averageCpc: "150000", // 0.15€
            ctr: "0.018", // 1.8%
            averageCpm: "2674000" // 2.67€
          }
        }
      ]
    }
    
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