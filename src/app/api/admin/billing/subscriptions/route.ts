import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Version simplifiée pour tester
    const subscriptions = await prisma.subscription.findMany()

    const formattedSubscriptions = await Promise.all(subscriptions.map(async (sub) => {
      const clientAccount = await prisma.clientAccount.findUnique({
        where: { id: sub.clientAccountId },
        include: {
          user: true,
          company: true
        }
      })

      return {
        id: sub.id,
        status: sub.status,
        amount: sub.amount || 0,
        plan: sub.plan || "standard",
        startDate: sub.currentPeriodStart,
        endDate: sub.endDate,
        clientAccount: {
          user: clientAccount?.user ? {
            firstName: clientAccount.user.firstName,
            lastName: clientAccount.user.lastName,
            email: clientAccount.user.email
          } : null,
          company: clientAccount?.company ? {
            name: clientAccount.company.name
          } : null
        }
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