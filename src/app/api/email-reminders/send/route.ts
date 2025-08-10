import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin (optionnel, pour les tests manuels)
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer tous les comptes clients éligibles pour les relances
    const eligibleAccounts = await prisma.clientAccount.findMany({
      where: {
        user: {
          emailVerified: true // Email validé
        },
        subscription: {
          OR: [
            { status: { not: 'ACTIVE' } }, // Pas d'abonnement actif
            { stripeSubscriptionId: null } // Pas de souscription Stripe
          ]
        }
      },
      include: {
        user: true,
        company: true,
        subscription: true,
        emailReminders: true
      }
    })

    const results = {
      processed: 0,
      sent: 0,
      errors: 0,
      details: [] as any[]
    }

    for (const account of eligibleAccounts) {
      try {
        results.processed++

        const daysSinceCreation = Math.floor(
          (Date.now() - account.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Déterminer quel email de relance envoyer
        let reminderType: string | null = null
        let shouldSend = false

        if (daysSinceCreation >= 1 && daysSinceCreation < 3) {
          reminderType = 'REMINDER_1'
          shouldSend = !account.emailReminders.some(r => r.reminderType === 'REMINDER_1' && r.status === 'SENT')
        } else if (daysSinceCreation >= 3 && daysSinceCreation < 7) {
          reminderType = 'REMINDER_2'
          shouldSend = !account.emailReminders.some(r => r.reminderType === 'REMINDER_2' && r.status === 'SENT')
        } else if (daysSinceCreation >= 7 && daysSinceCreation < 14) {
          reminderType = 'REMINDER_3'
          shouldSend = !account.emailReminders.some(r => r.reminderType === 'REMINDER_3' && r.status === 'SENT')
        } else if (daysSinceCreation >= 14) {
          reminderType = 'REMINDER_4'
          shouldSend = !account.emailReminders.some(r => r.reminderType === 'REMINDER_4' && r.status === 'SENT')
        }

        if (shouldSend && reminderType) {
          // Envoyer l'email de relance
          let emailResult = null

          switch (reminderType) {
            case 'REMINDER_1':
              emailResult = await EmailService.sendReminder1(
                account.user.email,
                account.user.firstName,
                account.company.name
              )
              break
            case 'REMINDER_2':
              emailResult = await EmailService.sendReminder2(
                account.user.email,
                account.user.firstName,
                account.company.name
              )
              break
            case 'REMINDER_3':
              emailResult = await EmailService.sendReminder3(
                account.user.email,
                account.user.firstName,
                account.company.name
              )
              break
            case 'REMINDER_4':
              emailResult = await EmailService.sendReminder4(
                account.user.email,
                account.user.firstName,
                account.company.name
              )
              break
          }

          if (emailResult) {
            // Enregistrer l'envoi dans la base de données
            await prisma.emailReminder.upsert({
              where: {
                clientAccountId_reminderType: {
                  clientAccountId: account.id,
                  reminderType
                }
              },
              update: {
                sentAt: new Date(),
                status: 'SENT'
              },
              create: {
                clientAccountId: account.id,
                reminderType,
                scheduledAt: new Date(),
                sentAt: new Date(),
                status: 'SENT'
              }
            })

            results.sent++
            results.details.push({
              accountId: account.id,
              email: account.user.email,
              reminderType,
              status: 'sent'
            })
          }
        } else {
          results.details.push({
            accountId: account.id,
            email: account.user.email,
            reminderType,
            status: 'already_sent_or_not_due'
          })
        }

      } catch (error) {
        results.errors++
        results.details.push({
          accountId: account.id,
          email: account.user.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        console.error(`Erreur lors du traitement du compte ${account.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Traitement terminé. ${results.processed} comptes traités, ${results.sent} emails envoyés, ${results.errors} erreurs.`,
      results
    })

  } catch (error) {
    console.error('Erreur lors de l\'envoi des relances:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi des relances" },
      { status: 500 }
    )
  }
} 