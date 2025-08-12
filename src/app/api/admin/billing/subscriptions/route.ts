import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Version simplifiée pour tester
    const subscriptions = await prisma.subscription.findMany()

    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      status: sub.status,
      amount: sub.amount || 0,
      plan: sub.plan || "standard",
      startDate: sub.currentPeriodStart,
      endDate: sub.endDate,
      clientAccount: {
        user: { firstName: "Client", lastName: "Test", email: "client@test.com" },
        company: { name: "Entreprise Test" }
      }
    }))

    return NextResponse.json({ 
      subscriptions: formattedSubscriptions,
      total: formattedSubscriptions.length
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des abonnements:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
} 