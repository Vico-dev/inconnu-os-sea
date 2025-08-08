import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params
    const { accountManagerId } = await request.json()

    if (!accountManagerId) {
      return NextResponse.json(
        { error: "ID de l&apos;Account Manager requis" },
        { status: 400 }
      )
    }

    // Vérifier que le ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier que l&apos;Account Manager existe
    const accountManager = await prisma.accountManager.findUnique({
      where: { id: accountManagerId }
    })

    if (!accountManager) {
      return NextResponse.json(
        { error: "Account Manager non trouvé" },
        { status: 404 }
      )
    }

    // Assigner l&apos;AM au ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        accountManagerId: accountManagerId
      },
      include: {
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
      }
    })

    return NextResponse.json({
      message: "Ticket assigné avec succès",
      ticket: {
        id: updatedTicket.id,
        accountManager: {
          id: updatedTicket.accountManager?.id,
          name: updatedTicket.accountManager ? 
            `${updatedTicket.accountManager.user.firstName} ${updatedTicket.accountManager.user.lastName}` : 
            null,
          email: updatedTicket.accountManager?.user.email
        }
      }
    })

  } catch (error) {
    console.error("Erreur lors de l&apos;attribution du ticket:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 