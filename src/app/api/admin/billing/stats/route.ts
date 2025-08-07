import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Récupérer toutes les subscriptions avec leurs informations
    const subscriptions = await prisma.subscription.findMany({
      include: {
        clientAccount: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            company: { select: { name: true } }
          }
        }
      }
    })

    // Calculer les statistiques
    const activeSubscriptions = subscriptions.filter(s => s.status === "ACTIVE").length
    const pendingPayments = subscriptions.filter(s => s.status === "TRIAL").length
    const overduePayments = subscriptions.filter(s => s.status === "CANCELLED").length

    // Calculer le revenu total
    const totalRevenue = subscriptions
      .filter(s => s.status === "ACTIVE")
      .reduce((sum, s) => sum + (s.amount || 0), 0)

    return NextResponse.json({
      activeSubscriptions,
      pendingPayments,
      overduePayments,
      totalRevenue,
      totalSubscriptions: subscriptions.length
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de facturation:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
} 