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
        companyName: user.clientAccount.company.name || '',
        industry: user.clientAccount.company.industry || '',
        size: user.clientAccount.company.size || '',
        website: user.clientAccount.company.website || ''
      }
      currentStep = 2
    }

    // Étape 2: Budget Google Ads (vérifier si le champ existe)
    try {
      if (user.clientAccount.googleAdsBudget) {
        progress.budget = {
          budget: user.clientAccount.googleAdsBudget
        }
        currentStep = 3
      }
    } catch (error) {
      console.log('Champ googleAdsBudget non disponible')
    }

    // Étape 3: Plan sélectionné
    if (user.clientAccount.subscriptionPlan) {
      progress.plan = {
        plan: user.clientAccount.subscriptionPlan
      }
      currentStep = 4
    }

    // Étape 4: Paiement (vérifier si le champ existe)
    try {
      if (user.clientAccount.paymentCompleted || user.clientAccount.subscription?.status === 'ACTIVE') {
        progress.payment = {
          completed: true
        }
        currentStep = 5
      }
    } catch (error) {
      console.log('Champ paymentCompleted non disponible')
    }

    // Étape 5: Connexion Google Ads (vérifier si le champ existe)
    try {
      if (user.clientAccount.googleAdsConnected) {
        progress.googleAds = {
          connected: true
        }
        currentStep = 6 // Onboarding terminé
      }
    } catch (error) {
      console.log('Champ googleAdsConnected non disponible')
    }

    return NextResponse.json({
      success: true,
      currentStep,
      progress,
      onboardingCompleted: user.clientAccount.onboardingCompleted || false,
      clientAccountId: user.clientAccount.id
    })

  } catch (error) {
    console.error('Erreur lors du chargement:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
} 