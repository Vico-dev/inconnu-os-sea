import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    // Trouver l'utilisateur et son compte client avec toutes les données
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { 
        clientAccount: {
          include: {
            company: true,
            subscription: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (!user.clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    // Déterminer l'étape actuelle basée sur les données existantes
    let currentStep = 1
    let progress = {
      company: null,
      budget: null,
      plan: null,
      payment: null,
      googleAds: null
    }

    // Étape 1: Profil entreprise
    if (user.clientAccount.company) {
      progress.company = {
        companyName: user.clientAccount.company.name,
        industry: user.clientAccount.company.industry,
        size: user.clientAccount.company.size,
        website: user.clientAccount.company.website
      }
      currentStep = 2
    }

    // Étape 2: Budget Google Ads
    if (user.clientAccount.googleAdsBudget) {
      progress.budget = {
        budget: user.clientAccount.googleAdsBudget
      }
      currentStep = 3
    }

    // Étape 3: Plan sélectionné
    if (user.clientAccount.subscriptionPlan) {
      progress.plan = {
        plan: user.clientAccount.subscriptionPlan
      }
      currentStep = 4
    }

    // Étape 4: Paiement
    if (user.clientAccount.paymentCompleted || user.clientAccount.subscription?.status === 'ACTIVE') {
      progress.payment = {
        completed: true
      }
      currentStep = 5
    }

    // Étape 5: Connexion Google Ads
    if (user.clientAccount.googleAdsConnected) {
      progress.googleAds = {
        connected: true
      }
      currentStep = 6 // Onboarding terminé
    }

    return NextResponse.json({
      success: true,
      currentStep,
      progress,
      onboardingCompleted: user.clientAccount.onboardingCompleted,
      clientAccountId: user.clientAccount.id
    })

  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
} 