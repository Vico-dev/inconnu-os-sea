import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const amId = searchParams.get('amId')

    if (!amId) {
      return NextResponse.json({ error: "ID de l&apos;AM requis" }, { status: 400 })
    }

    // Récupérer tous les tickets assignés à cet AM
    const tickets = await prisma.ticket.findMany({
      where: {
        accountManagerId: amId
      }
    })

    // Calculer les statistiques
    const total = tickets.length
    const open = tickets.filter(t => t.status === "OPEN").length
    const inProgress = tickets.filter(t => t.status === "IN_PROGRESS").length
    const resolved = tickets.filter(t => t.status === "RESOLVED").length
    const closed = tickets.filter(t => t.status === "CLOSED").length

    return NextResponse.json({
      total,
      open,
      inProgress,
      resolved,
      closed
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques AM:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
} 