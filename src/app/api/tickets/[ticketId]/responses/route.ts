import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params

    if (!ticketId) {
      return NextResponse.json(
        { error: "ID du ticket requis" },
        { status: 400 }
      )
    }

    console.log("Recherche du ticket:", ticketId)

    // D&apos;abord, vérifier si le ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    })

    console.log("Ticket trouvé:", ticket ? "Oui" : "Non")

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket non trouvé" },
        { status: 404 }
      )
    }

    // Récupérer les réponses séparément
    const responses = await prisma.ticketResponse.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' }
    })

    // Formater les réponses avec des informations supplémentaires
    const formattedResponses = responses.map(response => ({
      id: response.id,
      content: response.content,
      isFromAM: response.isFromAM,
      createdAt: response.createdAt,
      user: {
        id: "user-id",
        name: "Utilisateur",
        email: "user@example.com",
        role: "USER"
      }
    }))

    // Récupérer les informations du client et de l&apos;AM
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { id: ticket.clientAccountId },
      include: {
        user: {
          select: {
            id: true,
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
    })

    const accountManager = ticket.accountManagerId ? await prisma.accountManager.findUnique({
      where: { id: ticket.accountManagerId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    }) : null

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        accountManager: accountManager ? {
          id: accountManager.id,
          name: `${accountManager.user.firstName} ${accountManager.user.lastName}`,
          email: accountManager.user.email
        } : null,
        client: clientAccount ? {
          name: `${clientAccount.user.firstName} ${clientAccount.user.lastName}`,
          email: clientAccount.user.email,
          company: clientAccount.company.name
        } : {
          name: "Client",
          email: "client@example.com",
          company: "Company"
        }
      },
      responses: formattedResponses
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des réponses:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 