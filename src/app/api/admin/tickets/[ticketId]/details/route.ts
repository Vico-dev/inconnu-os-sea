import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params

    if (!ticketId) {
      return NextResponse.json({ error: "ID du ticket requis" }, { status: 400 })
    }

    // Récupérer le ticket avec toutes les informations
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        clientAccount: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            company: { select: { name: true } }
          }
        },
        accountManager: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 })
    }

    // Récupérer les réponses
    const responses = await prisma.ticketResponse.findMany({
      where: { ticketId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Formater les données
    const formattedTicket = {
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
      } : null,
      client: {
        name: `${ticket.clientAccount.user.firstName} ${ticket.clientAccount.user.lastName}`,
        email: ticket.clientAccount.user.email,
        company: ticket.clientAccount.company.name
      }
    }

    const formattedResponses = responses.map(response => ({
      id: response.id,
      content: response.content,
      isFromAM: response.isFromAM,
      createdAt: response.createdAt,
      user: {
        id: response.user.id,
        name: `${response.user.firstName} ${response.user.lastName}`,
        email: response.user.email,
        role: response.user.role
      }
    }))

    return NextResponse.json({
      ticket: formattedTicket,
      responses: formattedResponses
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des détails du ticket:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
} 