// Job de rappel pour les mandats publicitaires qui expirent bientôt
// TODO: Intégrer avec un système de cron (ex: node-cron, Vercel Cron Jobs, ou cron externe)

import { prisma } from '@/lib/db'

export async function checkExpiredMandates() {
  console.log('🔍 Vérification des mandats publicitaires...')
  
  try {
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(now.getDate() + 30)

    // Trouver les mandats qui expirent dans 30 jours
    const expiringMandates = await prisma.advertisingMandate.findMany({
      where: {
        status: 'ACTIVE',
        validUntil: {
          gte: now,
          lte: thirtyDaysFromNow
        }
      },
      include: {
        clientAccount: {
          include: {
            user: true
          }
        }
      }
    })

    // Trouver les mandats expirés
    const expiredMandates = await prisma.advertisingMandate.findMany({
      where: {
        status: 'ACTIVE',
        validUntil: {
          lt: now
        }
      },
      include: {
        clientAccount: {
          include: {
            user: true
          }
        }
      }
    })

    console.log(`📊 Mandats trouvés: ${expiringMandates.length} expirant bientôt, ${expiredMandates.length} expirés`)

    // Marquer les mandats expirés
    for (const mandate of expiredMandates) {
      await prisma.advertisingMandate.update({
        where: { id: mandate.id },
        data: { status: 'EXPIRED' }
      })
      
      // TODO: Envoyer email de notification d'expiration
      console.log(`❌ Mandat ${mandate.mandateNumber} expiré pour ${mandate.clientAccount.user.email}`)
      // await sendMandateExpiredEmail(mandate.clientAccount.user.email, mandate)
    }

    // Envoyer rappels pour les mandats qui expirent bientôt
    for (const mandate of expiringMandates) {
      const daysUntilExpiry = Math.ceil((mandate.validUntil!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      // TODO: Envoyer email de rappel
      console.log(`⚠️ Rappel mandat ${mandate.mandateNumber} expire dans ${daysUntilExpiry} jours pour ${mandate.clientAccount.user.email}`)
      // await sendMandateReminderEmail(mandate.clientAccount.user.email, mandate, daysUntilExpiry)
    }

    return {
      success: true,
      processed: {
        expiring: expiringMandates.length,
        expired: expiredMandates.length
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification des mandats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

// TODO: Implémenter l'envoi d'emails
async function sendMandateExpiredEmail(email: string, mandate: any) {
  // Utiliser le service d'email existant pour envoyer une notification d'expiration
  console.log(`TODO: Envoyer email d'expiration à ${email} pour le mandat ${mandate.mandateNumber}`)
}

async function sendMandateReminderEmail(email: string, mandate: any, daysUntilExpiry: number) {
  // Utiliser le service d'email existant pour envoyer un rappel
  console.log(`TODO: Envoyer rappel à ${email} pour le mandat ${mandate.mandateNumber} (expire dans ${daysUntilExpiry} jours)`)
}

// TODO: Configuration du cron job
// Exemple avec node-cron:
// import cron from 'node-cron'
// 
// // Exécuter tous les jours à 9h00
// cron.schedule('0 9 * * *', async () => {
//   console.log('🕘 Exécution du job de vérification des mandats...')
//   await checkExpiredMandates()
// })

// TODO: Endpoint API pour déclencher manuellement (admin uniquement)
// GET /api/admin/cron/check-mandates