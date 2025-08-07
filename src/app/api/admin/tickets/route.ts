import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les tickets avec les détails des clients et AM
    const tickets = await prisma.ticket.findMany({
      include: {
        clientAccount: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            company: {
              select: {
                name: true
              }
            }
          }
        },
        accountManager: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formater les tickets
    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      clientAccount: {
        user: {
          firstName: ticket.clientAccount.user.firstName,
          lastName: ticket.clientAccount.user.lastName,
          email: ticket.clientAccount.user.email
        },
        company: {
          name: ticket.clientAccount.company.name
        }
      },
      accountManager: ticket.accountManager ? {
        id: ticket.accountManager.id,
        user: {
          firstName: ticket.accountManager.user.firstName,
          lastName: ticket.accountManager.user.lastName,
          email: ticket.accountManager.user.email
        }
      } : null
    }))

    return NextResponse.json({
      tickets: formattedTickets,
      total: formattedTickets.length
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des tickets:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 