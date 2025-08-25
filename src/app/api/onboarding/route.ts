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
      currentChallenges,
      appointmentMode
    } = await request.json()

    const cleanGoals = Array.isArray(goals)
      ? goals.map((g: string) => (typeof g === 'string' ? g.replace(/&apos;/g, "'") : g))
      : null
    const cleanCurrentChallenges = typeof currentChallenges === 'string'
      ? currentChallenges.replace(/&apos;/g, "'")
      : currentChallenges

    console.log("Données reçues:", {
      userId,
      companyName,
      industry,
      goals,
      googleAdsAccount,
      dailyBudget
    })

    // Validation des champs requis
    if (!userId) {
      return NextResponse.json(
        { message: "Erreur d'authentification" },
        { status: 400 }
      )
    }

    // Validation des champs essentiels avec valeurs par défaut
    if (!companyName || companyName.trim() === "") {
      companyName = "Entreprise non spécifiée"
    }
    
    if (!industry || industry.trim() === "") {
      industry = "Autre"
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
          goals: cleanGoals ? JSON.stringify(cleanGoals) : null,
          googleAdsAccount: googleAdsAccount || null,
          currentChallenges: cleanCurrentChallenges || null
        }
      })

      // Mettre à jour le compte client
      updatedClientAccount = await prisma.clientAccount.update({
        where: { userId: userId },
        data: {
          onboardingCompleted: !appointmentMode, // Ne pas finaliser si mode RDV
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

    // Vérifier si Google Ads est connecté
    const googleAdsConnection = await prisma.googleAdsConnection.findFirst({
      where: { userId }
    })

    console.log("Onboarding terminé pour l&apos;utilisateur:", userId)
    console.log("Connexion Google Ads:", googleAdsConnection ? "Connecté" : "Non connecté")

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

    // Créer des notifications pour les admins
    try {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })

      if (admins.length > 0 && updatedClientAccount) {
        const adminNotifications = [] as Array<Parameters<typeof prisma.notification.createMany>[0]['data'][number]>

        // 1) Nouveau client onboardé
        for (const admin of admins) {
          adminNotifications.push({
            userId: admin.id,
            clientAccountId: updatedClientAccount.id,
            type: 'info',
            title: 'Nouveau client onboardé',
            message: `La société ${companyName} a terminé son onboarding. Vérifiez les prochaines étapes.`,
            actionUrl: '/admin/companies',
            priority: 'medium',
          })
        }

        // 2) Action requise: Attribuer un AM
        for (const admin of admins) {
          adminNotifications.push({
            userId: admin.id,
            clientAccountId: updatedClientAccount.id,
            type: 'warning',
            title: 'Attribuer un Account Manager',
            message: `Attribuez un AM au client ${companyName} pour démarrer la prise en charge.`,
            actionUrl: `/admin/users`,
            priority: 'high',
          })
        }

        // 3) Action requise: Compte Google Ads
        const needsGoogleAds = !googleAdsConnection
        if (needsGoogleAds) {
          for (const admin of admins) {
            adminNotifications.push({
              userId: admin.id,
              clientAccountId: updatedClientAccount.id,
              type: 'warning',
              title: 'Configurer un compte Google Ads',
              message: `Le client ${companyName} n'a pas de compte Google Ads. Créez/Reliez un compte.`,
              actionUrl: `/admin/google-ads-permissions`,
              priority: 'high',
            })
          }
        }

        if (adminNotifications.length > 0) {
          await prisma.notification.createMany({ data: adminNotifications })
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création des notifications admin:', error)
      // Non bloquant
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