import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const amId = searchParams.get('amId')

    if (!amId) {
      return NextResponse.json(
        { message: "ID AM requis" },
        { status: 400 }
      )
    }

    // Récupérer les tickets assignés à cet AM
    const tickets = await prisma.ticket.findMany({
      where: {
        accountManagerId: amId
      },
      include: {
        clientAccount: {
          include: {
            user: true,
            company: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      clientAccount: {
        id: ticket.clientAccount.id,
        user: {
          firstName: ticket.clientAccount.user.firstName,
          lastName: ticket.clientAccount.user.lastName,
          email: ticket.clientAccount.user.email
        },
        company: {
          name: ticket.clientAccount.company.name
        }
      }
    }))

    return NextResponse.json({
      tickets: formattedTickets,
      total: formattedTickets.length
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des tickets AM:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 