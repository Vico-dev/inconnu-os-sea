import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { message: "ID utilisateur requis" },
        { status: 400 }
      )
    }

    // Récupérer le client account
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { userId },
      include: {
        tickets: {
          include: {
            accountManager: {
              include: {
                user: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!clientAccount) {
      return NextResponse.json(
        { message: "Compte client non trouvé" },
        { status: 404 }
      )
    }

    const tickets = clientAccount.tickets.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      accountManager: ticket.accountManager ? {
        id: ticket.accountManager.id,
        name: `${ticket.accountManager.user.firstName} ${ticket.accountManager.user.lastName}`,
        email: ticket.accountManager.user.email
      } : null
    }))

    return NextResponse.json({
      tickets,
      total: tickets.length
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des tickets:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 