import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    // Vérifier les variables d'environnement
    if (!process.env.GOOGLE_ADS_CLIENT_ID || 
        !process.env.GOOGLE_ADS_CLIENT_SECRET || 
        !process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
        !process.env.GOOGLE_ADS_REDIRECT_URI) {
      return NextResponse.json(
        { error: "Configuration Google Ads manquante" },
        { status: 500 }
      )
    }

    // Construire l'URL d'autorisation OAuth pour le MCC
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.append('client_id', process.env.GOOGLE_ADS_CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', process.env.GOOGLE_ADS_REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/adwords')
    authUrl.searchParams.append('access_type', 'offline')
    authUrl.searchParams.append('prompt', 'consent')
    authUrl.searchParams.append('state', `mcc_${session.user.id}`) // Préfixe pour identifier le MCC

    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString()
    })

  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'auth MCC:', error)
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'URL d'authentification MCC" },
      { status: 500 }
    )
  }
} 