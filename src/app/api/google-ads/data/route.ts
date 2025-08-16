import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createGoogleAdsService } from "@/lib/google-ads-client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    // Récupérer les paramètres de date depuis l'URL
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    console.log('🔍 Paramètres de date:', { startDate, endDate })

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

    // Déterminer loginCustomerId (MCC) proprement depuis la connexion admin
    let loginCustomerId: string | undefined
    try {
      const accounts = JSON.parse(connection.accounts || '[]')
      const manager = accounts.find((a: any) => a.isManager) || accounts[0]
      if (manager?.customerId) loginCustomerId = String(manager.customerId).replace(/[-\s]/g, '')
    } catch {}
    const sanitizedCustomerId = String(permission.googleAdsCustomerId).replace(/[-\s]/g, '')
    if (loginCustomerId === sanitizedCustomerId) loginCustomerId = undefined

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

    // Utiliser l'API gRPC Google Ads
    console.log('🔍 Récupération des données via gRPC pour customer ID:', permission.googleAdsCustomerId)
    
    let campaignsData: any[] = []
    let daily: any[] = []
    let conversionsByType: any[] = []
    
    try {
      // Créer le service Google Ads
      const googleAdsService = createGoogleAdsService({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        refresh_token: connection.refreshToken!,
        customer_id: sanitizedCustomerId,
        loginCustomerId
      })

      // Tester la connexion d'abord
      console.log('🔍 Test de connexion gRPC...')
      await googleAdsService.testConnection()

      const startDateObj = startDate ? new Date(startDate) : undefined
      const endDateObj = endDate ? new Date(endDate) : undefined
      
      // Récupérer les campagnes
      console.log('🔍 Récupération des campagnes...')
      campaignsData = await googleAdsService.getCampaigns(startDateObj, endDateObj)

      // Récupérer tendances quotidiennes
      console.log('🔍 Récupération des tendances quotidiennes...')
      daily = await googleAdsService.getDailyMetrics(startDateObj, endDateObj)

      // Récupérer détail conversions
      console.log('🔍 Récupération des conversions par type...')
      conversionsByType = await googleAdsService.getConversionBreakdown(startDateObj, endDateObj)
      
      console.log('✅ Données gRPC récupérées:', campaignsData.length, 'campagnes')

    } catch (grpcError) {
      console.error('❌ Erreur gRPC (aucun fallback):', grpcError)
      return NextResponse.json(
        { error: 'Google Ads API indisponible. Veuillez réessayer plus tard.' },
        { status: 502 }
      )
    }
    
    // Traiter les données des campagnes
    const campaigns = campaignsData?.map((row: any) => ({
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
      data: { campaigns, metrics, daily, conversionsByType },
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