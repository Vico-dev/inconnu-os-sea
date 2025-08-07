import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les tickets avec leurs informations
    const tickets = await prisma.ticket.findMany({
      include: {
        accountManager: true
      }
    })

    // Calculer les statistiques
    const totalTickets = tickets.length
    const unassignedTickets = tickets.filter(t => !t.accountManager).length
    const assignedTickets = tickets.filter(t => t.accountManager).length
    const inProgressTickets = tickets.filter(t => t.status === "IN_PROGRESS").length
    const openTickets = tickets.filter(t => t.status === "OPEN").length
    const resolvedTickets = tickets.filter(t => t.status === "RESOLVED").length

    return NextResponse.json({
      total: totalTickets,
      unassigned: unassignedTickets,
      assigned: assignedTickets,
      inProgress: inProgressTickets,
      open: openTickets,
      resolved: resolvedTickets
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques des tickets:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
} 