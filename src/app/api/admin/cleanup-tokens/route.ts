import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cleanupExpiredTokens } from "@/lib/cleanup-tokens"

export async function POST(request: NextRequest) {
  try {
    // Vérifier que l'utilisateur est connecté et est admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Exécuter le nettoyage
    await cleanupExpiredTokens()

    return NextResponse.json({
      success: true,
      message: "Nettoyage des tokens expirés terminé"
    })

  } catch (error) {
    console.error('Erreur lors du nettoyage des tokens:', error)
    return NextResponse.json(
      { error: "Erreur lors du nettoyage des tokens" },
      { status: 500 }
    )
  }
} 