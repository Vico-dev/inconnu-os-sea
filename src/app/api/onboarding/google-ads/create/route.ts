import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { companyName, website, industry } = await request.json()

    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        clientAccount: {
          include: {
            company: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // TODO: Implémenter l'appel réel à l'API Google Ads pour créer un compte
    // Pour l'instant, on simule la création
    
    console.log("🆕 Création de compte Google Ads simulée pour:", {
      userId: session.user.id,
      companyName: companyName || user.clientAccount?.company?.name,
      website: website || user.clientAccount?.company?.website,
      industry
    })

    // Simulation d'un Customer ID généré
    const mockCustomerId = `123${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
    
    // Créer la connexion Google Ads en base
    const googleAdsConnection = await prisma.googleAdsConnection.create({
      data: {
        userId: session.user.id,
        customerId: mockCustomerId,
        isConnected: true,
        accounts: JSON.stringify([{
          customerId: mockCustomerId,
          name: `${companyName || 'Nouveau compte'} - Google Ads`,
          isManager: false,
          status: 'ACTIVE'
        }]),
        accessToken: 'mock_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 heure
        scope: 'https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.email',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log("✅ Compte Google Ads créé avec succès:", mockCustomerId)

    return NextResponse.json({
      success: true,
      customerId: mockCustomerId,
      message: "Compte Google Ads créé avec succès",
      connection: {
        id: googleAdsConnection.id,
        customerId: mockCustomerId,
        isConnected: true
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création du compte Google Ads:', error)
    return NextResponse.json(
      { error: "Erreur lors de la création du compte Google Ads" },
      { status: 500 }
    )
  }
} 