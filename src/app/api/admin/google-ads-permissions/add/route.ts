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
    const { clientAccountId, googleAdsCustomerId, permissions } = body

    if (!clientAccountId || !googleAdsCustomerId || !permissions) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      )
    }

    // Vérifier que le compte client existe
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { id: clientAccountId },
      include: { user: true }
    })

    if (!clientAccount) {
      return NextResponse.json(
        { error: "Compte client non trouvé" },
        { status: 404 }
      )
    }

    // Créer ou mettre à jour la permission
    const permission = await prisma.googleAdsPermission.upsert({
      where: {
        clientAccountId_googleAdsCustomerId: {
          clientAccountId,
          googleAdsCustomerId
        }
      },
      update: {
        permissions: JSON.stringify(permissions),
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        clientAccountId,
        userId: clientAccount.userId,
        googleAdsCustomerId,
        permissions: JSON.stringify(permissions),
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Permission ajoutée avec succès",
      permission: {
        id: permission.id,
        clientAccountId: permission.clientAccountId,
        googleAdsCustomerId: permission.googleAdsCustomerId,
        permissions: permission.permissions,
        isActive: permission.isActive
      }
    })

  } catch (error) {
    console.error("Erreur lors de l'ajout de permission:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de l'ajout de permission",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
} 