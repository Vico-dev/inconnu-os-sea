import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const { content, amId, userId } = await request.json()

    if (!content) {
      return NextResponse.json(
        { message: "Contenu requis" },
        { status: 400 }
      )
    }

    // Si c'est une réponse d'AM
    if (amId) {
      // Vérifier que le ticket existe
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId }
      })

      if (!ticket) {
        return NextResponse.json(
          { message: "Ticket non trouvé" },
          { status: 404 }
        )
      }

      // Vérifier que l'AM est bien assigné à ce ticket
      if (ticket.accountManagerId !== amId) {
        return NextResponse.json(
          { message: "Non autorisé à répondre à ce ticket" },
          { status: 403 }
        )
      }

      // Récupérer l'utilisateur AM
      const amUser = await prisma.accountManager.findUnique({
        where: { id: amId },
        include: { user: true }
      })

      if (!amUser) {
        return NextResponse.json(
          { message: "AM non trouvé" },
          { status: 404 }
        )
      }

      // Créer la réponse
      const response = await prisma.ticketResponse.create({
        data: {
          ticketId,
          userId: amUser.userId,
          content,
          isFromAM: true
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })

      // Mettre à jour le statut du ticket en "IN_PROGRESS" si il était "OPEN"
      if (ticket.status === "OPEN") {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { 
            status: "IN_PROGRESS",
            updatedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        message: "Réponse envoyée avec succès",
        response: {
          id: response.id,
          content: response.content,
          isFromAM: response.isFromAM,
          createdAt: response.createdAt,
          user: {
            firstName: response.user.firstName,
            lastName: response.user.lastName
          }
        }
      })
    }

    // Si c'est une réponse de client
    if (userId) {
      // Vérifier que l'utilisateur existe et est un client
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { clientAccount: true }
      })

      if (!user || user.role !== "CLIENT") {
        return NextResponse.json(
          { message: "Utilisateur non autorisé" },
          { status: 403 }
        )
      }

      // Vérifier que le ticket appartient à ce client
      const ticket = await prisma.ticket.findFirst({
        where: {
          id: ticketId,
          clientAccountId: user.clientAccount?.id
        }
      })

      if (!ticket) {
        return NextResponse.json(
          { message: "Ticket non trouvé ou non autorisé" },
          { status: 404 }
        )
      }

      // Créer la réponse de client
      const response = await prisma.ticketResponse.create({
        data: {
          ticketId,
          userId,
          content,
          isFromAM: false
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })

      return NextResponse.json({
        message: "Réponse envoyée avec succès",
        response: {
          id: response.id,
          content: response.content,
          isFromAM: response.isFromAM,
          createdAt: response.createdAt,
          user: {
            firstName: response.user.firstName,
            lastName: response.user.lastName
          }
        }
      })
    }

    return NextResponse.json(
      { message: "ID d'utilisateur ou d'AM requis" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Erreur lors de l'envoi de la réponse:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 