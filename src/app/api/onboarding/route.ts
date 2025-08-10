import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      companyName,
      website,
      industry,
      dailyBudget,
      teamSize,
      goals,
      googleAdsAccount,
      currentChallenges
    } = await request.json()

    console.log("Données reçues:", {
      userId,
      companyName,
      industry,
      goals,
      googleAdsAccount,
      dailyBudget
    })

    // Validation des champs requis
    if (!userId || !companyName || !industry) {
      return NextResponse.json(
        { message: "Champs requis manquants" },
        { status: 400 }
      )
    }

    // Calcul du budget mensuel
    let monthlyBudget = null
    if (dailyBudget) {
      const dailyBudgetValue = parseFloat(dailyBudget)
      monthlyBudget = Math.round(dailyBudgetValue * 30)
      console.log(`Budget journalier: ${dailyBudgetValue}€, Budget mensuel calculé: ${monthlyBudget}€`)
    }

    // Récupérer le compte client avec sa Company
    const existingClientAccount = await prisma.clientAccount.findUnique({
      where: { userId: userId },
      include: {
        company: true,
        subscription: true
      }
    })

    console.log("Compte client existant:", existingClientAccount)

    let updatedClientAccount

    if (existingClientAccount) {
      // Mettre à jour la Company existante
      const updatedCompany = await prisma.company.update({
        where: { id: existingClientAccount.companyId },
        data: {
          name: companyName,
          website: website || null,
          industry,
          teamSize: teamSize || null,
          goals: goals ? JSON.stringify(goals) : null,
          googleAdsAccount: googleAdsAccount || null,
          currentChallenges: currentChallenges || null
        }
      })

      // Mettre à jour le compte client
      updatedClientAccount = await prisma.clientAccount.update({
        where: { userId: userId },
        data: {
          onboardingCompleted: true,
          monthlyBudget
        }
      })

      // Créer un abonnement d&apos;essai seulement s&apos;il n&apos;en existe pas déjà
      if (!existingClientAccount.subscription) {
        await prisma.subscription.create({
          data: {
            clientAccountId: updatedClientAccount.id,
            plan: "BASIC",
            status: "TRIAL",
            amount: 0,
            currency: "EUR",
            trialStart: new Date(),
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 jours d&apos;essai
          }
        })
      }

    } else {
      // Créer la Company
      const company = await prisma.company.create({
        data: {
          name: companyName,
          website: website || null,
          industry,
          teamSize: teamSize || null,
          goals: goals ? JSON.stringify(goals) : null,
          googleAdsAccount: googleAdsAccount || null,
          currentChallenges: currentChallenges || null
        }
      })

      // Créer un nouveau compte client
      updatedClientAccount = await prisma.clientAccount.create({
        data: {
          userId: userId,
          companyId: company.id,
          onboardingCompleted: true,
          monthlyBudget
        }
      })

      // Créer un abonnement d&apos;essai
      await prisma.subscription.create({
        data: {
          clientAccountId: updatedClientAccount.id,
          plan: "BASIC",
          status: "TRIAL",
          amount: 0,
          currency: "EUR",
          trialStart: new Date(),
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 jours d&apos;essai
        }
      })
    }

    console.log("Onboarding terminé pour l&apos;utilisateur:", userId)

    // Envoyer l'email de bienvenue
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (user) {
        await EmailService.sendWelcomeEmail(
          user.email,
          user.firstName,
          companyName,
          "Essai gratuit"
        )
      }
    } catch (error) {
      console.error('Erreur envoi email de bienvenue:', error)
      // Ne pas faire échouer l'onboarding si l'email échoue
    }

    return NextResponse.json({
      message: "Onboarding terminé avec succès",
      clientAccountId: updatedClientAccount.id
    })

  } catch (error) {
    console.error("Erreur détaillée lors de l&apos;onboarding:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 