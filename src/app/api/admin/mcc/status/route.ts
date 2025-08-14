import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

    // Vérifier s'il existe une connexion MCC active
    const mccConnection = await prisma.googleAdsConnection.findFirst({
      where: {
        userId: session.user.id,
        isConnected: true
      }
    })

    return NextResponse.json({
      success: true,
      isConnected: !!mccConnection,
      connection: mccConnection ? {
        id: mccConnection.id,
        connectedAt: mccConnection.connectedAt,
        tokenExpiry: mccConnection.tokenExpiry
      } : null
    })

  } catch (error) {
    console.error("Erreur lors de la vérification du statut MCC:", error)
    return NextResponse.json(
      { error: "Erreur lors de la vérification du statut MCC" },
      { status: 500 }
    )
  }
} 