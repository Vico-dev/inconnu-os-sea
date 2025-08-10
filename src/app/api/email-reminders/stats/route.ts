import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Récupérer les statistiques globales
    const [
      totalAccounts,
      eligibleAccounts,
      sentReminders,
      pendingReminders
    ] = await Promise.all([
      // Total des comptes clients
      prisma.clientAccount.count({
        where: {
          user: {
            emailVerified: true
          }
        }
      }),

      // Comptes éligibles pour les relances (email validé + pas d'abonnement actif)
      prisma.clientAccount.count({
        where: {
          user: {
            emailVerified: true
          },
          subscription: {
            OR: [
              { status: { not: 'ACTIVE' } },
              { stripeSubscriptionId: null }
            ]
          }
        }
      }),

      // Total des relances envoyées
      prisma.emailReminder.count({
        where: {
          status: 'SENT'
        }
      }),

      // Relances en attente (comptes éligibles sans relance envoyée)
      prisma.clientAccount.count({
        where: {
          user: {
            emailVerified: true
          },
          subscription: {
            OR: [
              { status: { not: 'ACTIVE' } },
              { stripeSubscriptionId: null }
            ]
          },
          emailReminders: {
            none: {}
          }
        }
      })
    ])

    return NextResponse.json({
      totalAccounts,
      eligibleAccounts,
      sentReminders,
      pendingReminders
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  }
} 