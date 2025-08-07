import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les Account Managers
    const accountManagers = await prisma.accountManager.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        user: {
          firstName: 'asc'
        }
      }
    })

    // Formater les Account Managers
    const formattedAMs = accountManagers.map(am => ({
      id: am.id,
      user: {
        firstName: am.user.firstName,
        lastName: am.user.lastName,
        email: am.user.email
      }
    }))

    return NextResponse.json({
      accountManagers: formattedAMs,
      total: formattedAMs.length
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des Account Managers:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 