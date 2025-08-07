import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const { subject, description, status, priority, category } = await request.json()

    if (!ticketId) {
      return NextResponse.json({ error: "ID du ticket requis" }, { status: 400 })
    }

    // Vérifier que le ticket existe
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    })

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket non trouvé" }, { status: 404 })
    }

    // Mettre à jour le ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        subject: subject || existingTicket.subject,
        description: description || existingTicket.description,
        status: status || existingTicket.status,
        priority: priority || existingTicket.priority,
        category: category || existingTicket.category,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: "Ticket mis à jour avec succès",
      ticket: {
        id: updatedTicket.id,
        subject: updatedTicket.subject,
        description: updatedTicket.description,
        status: updatedTicket.status,
        priority: updatedTicket.priority,
        category: updatedTicket.category,
        updatedAt: updatedTicket.updatedAt
      }
    })

  } catch (error) {
    console.error("Erreur lors de la mise à jour du ticket:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
} 