import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

    const { hasExistingAccount } = await request.json()

    // Scopes pour contrôle total
    const scopes = [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]

    // Paramètres OAuth
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_ADS_REDIRECT_URI!,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: `onboarding_${session.user.id}_${hasExistingAccount ? 'existing' : 'new'}`
    })

    // URL d'autorisation Google
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return NextResponse.json({
      success: true,
      authUrl,
      message: hasExistingAccount 
        ? "Connexion à votre compte Google Ads existant"
        : "Création d'un nouveau compte Google Ads"
    })

  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'autorisation:', error)
    return NextResponse.json(
      { error: "Erreur lors de la connexion Google Ads" },
      { status: 500 }
    )
  }
} 