import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { GoogleAdsService } from "@/lib/google-ads-service"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }

    const connection = await prisma.googleAdsConnection.findUnique({
      where: { userId: session.user.id }
    })

    if (!connection || !connection.isConnected) {
      return NextResponse.json({ error: "Connexion Google Ads non trouvée" }, { status: 404 })
    }

    const accounts = JSON.parse(connection.accounts || '[]')
    if (accounts.length === 0) {
      return NextResponse.json({ error: "Aucun compte Google Ads trouvé" }, { status: 404 })
    }

    const customerId = accounts[0].customer.id
    
    try {
      const campaigns = await GoogleAdsService.getCampaigns(customerId, connection.refreshToken!)
      const metrics = await GoogleAdsService.getAccountMetrics(customerId, connection.refreshToken!)

      return NextResponse.json({
        success: true,
        data: { campaigns, metrics, accounts }
      })

    } catch (apiError) {
      console.error('Erreur API Google Ads:', apiError)
      return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 })
    }

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
} 