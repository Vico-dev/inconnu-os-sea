import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Statistiques des utilisateurs
    const totalUsers = await prisma.user.count()
    const activeClients = await prisma.clientAccount.count({
      where: {
        status: "ACTIVE"
      }
    })
    const accountManagers = await prisma.user.count({
      where: {
        role: "ACCOUNT_MANAGER"
      }
    })

    // Statistiques des abonnements
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: "ACTIVE"
      }
    })
    const trialSubscriptions = await prisma.subscription.count({
      where: {
        status: "TRIAL"
      }
    })
    const cancelledSubscriptions = await prisma.subscription.count({
      where: {
        status: "CANCELLED"
      }
    })

    // Calcul du MRR (Monthly Recurring Revenue)
    const activeSubs = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE"
      },
      select: {
        amount: true
      }
    })
    const mrr = activeSubs.reduce((total, sub) => total + (sub.amount || 0), 0)

    // Statistiques des entreprises
    const totalCompanies = await prisma.company.count()
    const companiesByIndustry = await prisma.company.groupBy({
      by: ['industry'],
      _count: {
        industry: true
      }
    })

    // Utilisateurs récents (7 derniers jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Statistiques d&apos;onboarding
    const completedOnboarding = await prisma.clientAccount.count({
      where: {
        onboardingCompleted: true
      }
    })
    const pendingOnboarding = await prisma.clientAccount.count({
      where: {
        onboardingCompleted: false
      }
    })

    // Statistiques Google Ads
    const googleAdsConnected = await prisma.clientAccount.count({
      where: {
        googleAdsConnected: true
      }
    })

    return NextResponse.json({
      users: {
        total: totalUsers,
        activeClients,
        accountManagers,
        recentUsers
      },
      subscriptions: {
        active: activeSubscriptions,
        trial: trialSubscriptions,
        cancelled: cancelledSubscriptions,
        total: activeSubscriptions + trialSubscriptions + cancelledSubscriptions
      },
      revenue: {
        mrr,
        conversionRate: totalUsers > 0 ? Math.round((activeSubscriptions / totalUsers) * 100) : 0,
        churnRate: totalUsers > 0 ? Math.round((cancelledSubscriptions / totalUsers) * 100) : 0
      },
      companies: {
        total: totalCompanies,
        byIndustry: companiesByIndustry
      },
      onboarding: {
        completed: completedOnboarding,
        pending: pendingOnboarding,
        completionRate: (completedOnboarding + pendingOnboarding) > 0 ? 
          Math.round((completedOnboarding / (completedOnboarding + pendingOnboarding)) * 100) : 0
      },
      integrations: {
        googleAdsConnected
      }
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 