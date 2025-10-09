import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ OAuth: session manquante')
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      )
    }

    console.log('🔍 OAuth: session OK, userId:', session.user.id, 'role:', session.user.role)

    // Vérifier les variables d'environnement
    if (!process.env.GOOGLE_ADS_CLIENT_ID || 
        !process.env.GOOGLE_ADS_CLIENT_SECRET || 
        !process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
        !process.env.GOOGLE_ADS_REDIRECT_URI) {
      console.log('❌ OAuth: variables manquantes')
      return NextResponse.json(
        { error: "Configuration Google Ads manquante" },
        { status: 500 }
      )
    }

    // Construire l'URL d'autorisation OAuth
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.append('client_id', process.env.GOOGLE_ADS_CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', process.env.GOOGLE_ADS_REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/adwords')
    authUrl.searchParams.append('access_type', 'offline')
    authUrl.searchParams.append('prompt', 'consent')
    authUrl.searchParams.append('state', session.user.id) // Pour identifier l'utilisateur

    console.log('🔍 OAuth: redirection vers:', authUrl.toString())

    // Redirige directement vers Google au lieu de renvoyer du JSON
    return NextResponse.redirect(authUrl.toString(), 302)

  } catch (error) {
    console.error('❌ OAuth: erreur génération URL:', error)
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'URL d'authentification" },
      { status: 500 }
    )
  }
} 