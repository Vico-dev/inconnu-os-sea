import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { GoogleAdsMCCService } from "@/lib/google-ads-mcc"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const clientAccountId = searchParams.get('clientAccountId')

    if (!clientAccountId) {
      return NextResponse.json(
        { error: "ID du compte client requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès à ce compte client
    const clientAccount = await prisma.clientAccount.findFirst({
      where: {
        id: clientAccountId,
        userId: session.user.id
      }
    })

    if (!clientAccount) {
      return NextResponse.json(
        { error: "Accès non autorisé à ce compte client" },
        { status: 403 }
      )
    }

    // Récupérer la connexion MCC (connexion unique pour l'agence)
    const mccConnection = await prisma.googleAdsConnection.findFirst({
      where: {
        isConnected: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!mccConnection) {
      return NextResponse.json(
        { error: "Aucune connexion MCC configurée" },
        { status: 404 }
      )
    }

    // Initialiser le service MCC
    const mccService = new GoogleAdsMCCService({
      clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      refreshToken: mccConnection.refreshToken!
    })

    // Récupérer les données Google Ads pour le client
    const clientData = await mccService.getClientGoogleAdsData(clientAccountId)

    // Calculer les métriques globales
    const globalMetrics = clientData.reduce((acc, account) => {
      return {
        impressions: acc.impressions + account.metrics.impressions,
        clicks: acc.clicks + account.metrics.clicks,
        cost: acc.cost + account.metrics.cost,
        conversions: acc.conversions + account.metrics.conversions,
        accounts: acc.accounts + 1,
        campaigns: acc.campaigns + account.campaigns.length
      }
    }, {
      impressions: 0,
      clicks: 0,
      cost: 0,
      conversions: 0,
      accounts: 0,
      campaigns: 0
    })

    // Calculer les métriques dérivées globales
    const globalCtr = globalMetrics.impressions > 0 ? (globalMetrics.clicks / globalMetrics.impressions) * 100 : 0
    const globalAverageCpc = globalMetrics.clicks > 0 ? globalMetrics.cost / globalMetrics.clicks : 0

    return NextResponse.json({
      success: true,
      data: {
        accounts: clientData,
        globalMetrics: {
          ...globalMetrics,
          ctr: globalCtr,
          averageCpc: globalAverageCpc
        },
        connected: true,
        lastSync: mccConnection.updatedAt
      }
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des données MCC:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de la récupération des données Google Ads",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification (admin seulement)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { clientAccountId, googleAdsCustomerId, permissions } = body

    if (!clientAccountId || !googleAdsCustomerId || !permissions) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      )
    }

    // Récupérer la connexion MCC
    const mccConnection = await prisma.googleAdsConnection.findFirst({
      where: {
        isConnected: true
      }
    })

    if (!mccConnection) {
      return NextResponse.json(
        { error: "Aucune connexion MCC configurée" },
        { status: 404 }
      )
    }

    // Initialiser le service MCC
    const mccService = new GoogleAdsMCCService({
      clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      refreshToken: mccConnection.refreshToken!
    })

    // Ajouter la permission
    await mccService.addClientPermission(
      clientAccountId,
      session.user.id,
      googleAdsCustomerId,
      permissions
    )

    return NextResponse.json({
      success: true,
      message: "Permission ajoutée avec succès"
    })

  } catch (error) {
    console.error("Erreur lors de l'ajout de permission:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de permission" },
      { status: 500 }
    )
  }
} 