import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const { content, amId } = await request.json()

    if (!content) {
      return NextResponse.json({ message: "Contenu requis" }, { status: 400 })
    }

    // Vérifier que le ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      return NextResponse.json({ message: "Ticket non trouvé" }, { status: 404 })
    }

    // Créer la réponse (admin peut répondre sans être AM assigné)
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId,
        userId: amId, // Utiliser l'ID de l'AM ou de l'admin
        content,
        isFromAM: true // Marquer comme réponse d'AM/Admin
      },
      include: {
        user: { select: { firstName: true, lastName: true } }
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

  } catch (error) {
    console.error("Erreur lors de l'envoi de la réponse:", error)
    return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 })
  }
} 