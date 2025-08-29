import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'ACCOUNT_MANAGER')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { email, plan, status } = body as { email?: string; plan?: 'SMALL_BUDGET' | 'MEDIUM_BUDGET' | 'LARGE_BUDGET'; status?: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' }

    if (!email || !plan) {
      return NextResponse.json({ error: 'email et plan sont requis' }, { status: 400 })
    }

    const validPlans = ['SMALL_BUDGET', 'MEDIUM_BUDGET', 'LARGE_BUDGET'] as const
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const planAmounts: Record<typeof validPlans[number], number> = {
      SMALL_BUDGET: 200,
      MEDIUM_BUDGET: 400,
      LARGE_BUDGET: 600,
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const clientAccount = await prisma.clientAccount.findUnique({ where: { userId: user.id } })
    if (!clientAccount) {
      return NextResponse.json({ error: 'ClientAccount introuvable pour cet utilisateur' }, { status: 404 })
    }

    const desiredStatus: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' = status || 'TRIAL'

    const existing = await prisma.subscription.findUnique({ where: { clientAccountId: clientAccount.id } })
    if (existing) {
      const updated = await prisma.subscription.update({
        where: { clientAccountId: clientAccount.id },
        data: {
          plan,
          status: desiredStatus,
          amount: planAmounts[plan],
          currency: 'EUR',
          currentPeriodStart: existing.currentPeriodStart ?? new Date(),
          currentPeriodEnd: existing.currentPeriodEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
      await prisma.clientAccount.update({ where: { id: clientAccount.id }, data: { subscriptionPlan: plan } })
      return NextResponse.json({ success: true, subscription: updated })
    }

    const created = await prisma.subscription.create({
      data: {
        clientAccountId: clientAccount.id,
        plan,
        status: desiredStatus,
        amount: planAmounts[plan],
        currency: 'EUR',
        trialStart: desiredStatus === 'TRIAL' ? new Date() : null,
        trialEnd: desiredStatus === 'TRIAL' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    await prisma.clientAccount.update({ where: { id: clientAccount.id }, data: { subscriptionPlan: plan } })

    return NextResponse.json({ success: true, subscription: created })
  } catch (error) {
    console.error('Erreur création/mise à jour de souscription (admin):', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
} 