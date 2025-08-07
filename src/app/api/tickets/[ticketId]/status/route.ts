import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { message: "Statut requis" },
        { status: 400 }
      )
    }

    // Vérifier que le statut est valide
    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Statut invalide" },
        { status: 400 }
      )
    }

    // Mettre à jour le statut du ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: "Statut mis à jour avec succès",
      ticket: {
        id: updatedTicket.id,
        status: updatedTicket.status,
        updatedAt: updatedTicket.updatedAt
      }
    })

  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 