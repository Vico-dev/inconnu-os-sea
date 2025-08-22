import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Début de la création de compte Google Ads")
    
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.error("❌ Utilisateur non authentifié")
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    console.log("✅ Utilisateur authentifié:", session.user.id)

    // Récupérer les données de la requête
    const body = await request.json()
    console.log("📦 Données reçues:", body)
    
    const { companyName, website, industry } = body

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
      console.error("❌ Utilisateur non trouvé en base")
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    console.log("✅ Utilisateur trouvé en base:", user.email)

    // Vérifier si une connexion Google Ads existe déjà
    const existingConnection = await prisma.googleAdsConnection.findFirst({
      where: { userId: session.user.id }
    })

    if (existingConnection && existingConnection.isConnected) {
      console.log("⚠️ Connexion Google Ads déjà existante et connectée")
      return NextResponse.json({
        success: true,
        message: "Compte Google Ads déjà connecté",
        connection: {
          id: existingConnection.id,
          isConnected: true
        }
      })
    }

    // Si une connexion existe mais n'est pas connectée, la supprimer
    if (existingConnection && !existingConnection.isConnected) {
      console.log("🗑️ Suppression de la connexion non connectée existante")
      await prisma.googleAdsConnection.delete({
        where: { id: existingConnection.id }
      })
    }

    // ⚠️ ATTENTION: Cette section utilise des données simulées
    // TODO: Remplacer par l'intégration réelle avec l'API Google Ads
    // - Appel à l'API Google Ads pour créer un compte
    // - Gestion des erreurs et des cas limites
    // - Validation des permissions et des quotas
    
    console.log("🆕 Création de compte Google Ads simulée pour:", {
      userId: session.user.id,
      companyName: companyName || user.clientAccount?.company?.name,
      website: website || user.clientAccount?.company?.website,
      industry
    })

    // Simulation d'un Customer ID généré
    const mockCustomerId = `123${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
    
    console.log("🆔 Customer ID généré:", mockCustomerId)
    
    // Créer la connexion Google Ads en base
    const googleAdsConnection = await prisma.googleAdsConnection.create({
      data: {
        userId: session.user.id,
        isConnected: true,
        accounts: JSON.stringify([{
          customerId: mockCustomerId,
          name: `${companyName || user.clientAccount?.company?.name || 'Nouveau compte'} - Google Ads`,
          isManager: false,
          status: 'ACTIVE'
        }]),
        accessToken: 'mock_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        tokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 heure
        connectedAt: new Date()
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
    console.error('❌ Erreur lors de la création du compte Google Ads:', error)
    
    // Retourner une erreur plus détaillée
    return NextResponse.json(
      { 
        error: "Erreur lors de la création du compte Google Ads",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
} 