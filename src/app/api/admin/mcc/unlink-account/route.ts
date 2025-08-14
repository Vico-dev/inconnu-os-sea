import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId requis" },
        { status: 400 }
      )
    }

    // Désactiver la permission
    const permission = await prisma.googleAdsPermission.updateMany({
      where: {
        googleAdsCustomerId: customerId,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Compte MCC délié avec succès",
      updatedCount: permission.count
    })

  } catch (error) {
    console.error("Erreur lors de la déliaison du compte MCC:", error)
    return NextResponse.json(
      { error: "Erreur lors de la déliaison du compte MCC" },
      { status: 500 }
    )
  }
} 