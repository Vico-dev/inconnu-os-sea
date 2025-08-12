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
    const requiredVars = [
      'GOOGLE_ADS_CLIENT_ID',
      'GOOGLE_ADS_CLIENT_SECRET', 
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'GOOGLE_ADS_REDIRECT_URI'
    ]

    const missingVars = requiredVars.filter(varName => !process.env[varName])
    const presentVars = requiredVars.filter(varName => process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Variables d'environnement manquantes: ${missingVars.join(', ')}`,
        details: {
          missing: missingVars,
          present: presentVars,
          total: requiredVars.length,
          configured: presentVars.length
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Configuration Google Ads correcte",
      details: {
        clientId: process.env.GOOGLE_ADS_CLIENT_ID?.substring(0, 10) + '...',
        redirectUri: process.env.GOOGLE_ADS_REDIRECT_URI,
        developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? 'Configuré' : 'Manquant',
        totalVars: requiredVars.length,
        configured: presentVars.length
      }
    })

  } catch (error) {
    console.error('Erreur lors du test de configuration:', error)
    return NextResponse.json({
      success: false,
      message: "Erreur lors du test de configuration",
      details: error
    }, { status: 500 })
  }
} 