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
    const { customerId, clientId } = body

    if (!customerId || !clientId) {
      return NextResponse.json(
        { error: "customerId et clientId requis" },
        { status: 400 }
      )
    }

    // Récupérer le client et son clientAccount
    const user = await prisma.user.findUnique({
      where: { id: clientId },
      include: {
        clientAccount: true
      }
    })

    if (!user || !user.clientAccount) {
      return NextResponse.json(
        { error: "Client ou compte client non trouvé" },
        { status: 404 }
      )
    }

    // Créer ou mettre à jour la permission
    const permission = await prisma.googleAdsPermission.upsert({
      where: {
        clientAccountId_googleAdsCustomerId: {
          clientAccountId: user.clientAccount.id,
          googleAdsCustomerId: customerId
        }
      },
      update: {
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        clientAccountId: user.clientAccount.id,
        userId: user.id,
        googleAdsCustomerId: customerId,
        permissions: JSON.stringify({
          read: true,
          write: false,
          admin: false
        }),
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Compte MCC lié avec succès",
      permission: {
        id: permission.id,
        customerId: permission.googleAdsCustomerId,
        clientId: permission.userId
      }
    })

  } catch (error) {
    console.error("Erreur lors de la liaison du compte MCC:", error)
    return NextResponse.json(
      { error: "Erreur lors de la liaison du compte MCC" },
      { status: 500 }
    )
  }
} 