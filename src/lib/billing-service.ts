import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { EmailService } from '@/lib/email-service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export class BillingService {
  /**
   * Créer une subscription Stripe
   */
  static async createSubscription(
    clientAccountId: string,
    plan: string,
    customerId: string
  ) {
    try {
      // Déterminer le price ID selon le plan
      const priceId = this.getPriceIdForPlan(plan)
      
      if (!priceId) {
        throw new Error(`Plan non reconnu: ${plan}`)
      }

      // Créer la subscription Stripe
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })

      // Mettre à jour la subscription en base
      await prisma.subscription.update({
        where: { clientAccountId },
        data: {
          stripeSubscriptionId: subscription.id,
          status: subscription.status.toUpperCase(),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          amount: subscription.items.data[0].price.unit_amount! / 100,
          currency: subscription.currency.toUpperCase()
        }
      })

      return subscription
    } catch (error) {
      console.error('Erreur création subscription:', error)
      throw error
    }
  }

  /**
   * Annuler une subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      // Annuler côté Stripe
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      })

      // Mettre à jour en base
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: 'CANCELLED',
          endDate: new Date(subscription.current_period_end * 1000)
        }
      })

      return subscription
    } catch (error) {
      console.error('Erreur annulation subscription:', error)
      throw error
    }
  }

  /**
   * Gérer les impayés automatiquement
   */
  static async handleOverduePayments() {
    try {
      console.log('🔄 Vérification des impayés...')

      // Trouver les subscriptions en retard
      const overdueSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'PAST_DUE',
          currentPeriodEnd: {
            lt: new Date()
          }
        },
        include: {
          clientAccount: {
            include: {
              user: true,
              company: true
            }
          }
        }
      })

      for (const subscription of overdueSubscriptions) {
        await this.processOverdueSubscription(subscription)
      }

      console.log(`✅ ${overdueSubscriptions.length} impayés traités`)
    } catch (error) {
      console.error('Erreur traitement impayés:', error)
    }
  }

  /**
   * Traiter une subscription en retard
   */
  private static async processOverdueSubscription(subscription: any) {
    try {
      const daysOverdue = Math.floor(
        (Date.now() - subscription.currentPeriodEnd.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Suspension après 7 jours
      if (daysOverdue >= 7 && subscription.status !== 'SUSPENDED') {
        await this.suspendAccount(subscription)
      }
      // Annulation après 30 jours
      else if (daysOverdue >= 30 && subscription.status !== 'CANCELLED') {
        await this.cancelOverdueSubscription(subscription)
      }
      // Relance après 3 jours
      else if (daysOverdue >= 3) {
        await this.sendOverdueReminder(subscription, daysOverdue)
      }
    } catch (error) {
      console.error('Erreur traitement subscription en retard:', error)
    }
  }

  /**
   * Suspendre un compte pour impayé
   */
  private static async suspendAccount(subscription: any) {
    try {
      // Mettre à jour le statut
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'SUSPENDED' }
      })

      await prisma.clientAccount.update({
        where: { id: subscription.clientAccountId },
        data: { status: 'SUSPENDED' }
      })

      // Envoyer notification de suspension
      await EmailService.sendBillingReminder(
        subscription.clientAccount.user.email,
        subscription.clientAccount.user.firstName,
        subscription.clientAccount.company.name,
        subscription.plan,
        `${subscription.amount} ${subscription.currency}`,
        new Date().toISOString()
      )

      console.log(`⏸️ Compte suspendu: ${subscription.clientAccount.user.email}`)
    } catch (error) {
      console.error('Erreur suspension compte:', error)
    }
  }

  /**
   * Annuler une subscription en retard
   */
  private static async cancelOverdueSubscription(subscription: any) {
    try {
      // Annuler côté Stripe
      if (subscription.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
      }

      // Mettre à jour en base
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          endDate: new Date()
        }
      })

      await prisma.clientAccount.update({
        where: { id: subscription.clientAccountId },
        data: { status: 'CANCELLED' }
      })

      console.log(`🗑️ Subscription annulée: ${subscription.clientAccount.user.email}`)
    } catch (error) {
      console.error('Erreur annulation subscription en retard:', error)
    }
  }

  /**
   * Envoyer une relance pour impayé
   */
  private static async sendOverdueReminder(subscription: any, daysOverdue: number) {
    try {
      await EmailService.sendBillingReminder(
        subscription.clientAccount.user.email,
        subscription.clientAccount.user.firstName,
        subscription.clientAccount.company.name,
        subscription.plan,
        `${subscription.amount} ${subscription.currency}`,
        new Date().toISOString()
      )

      console.log(`📧 Relance envoyée (${daysOverdue} jours): ${subscription.clientAccount.user.email}`)
    } catch (error) {
      console.error('Erreur envoi relance:', error)
    }
  }

  /**
   * Réactiver un compte après paiement
   */
  static async reactivateAccount(subscriptionId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
        include: {
          clientAccount: {
            include: {
              user: true,
              company: true
            }
          }
        }
      })

      if (!subscription) {
        throw new Error('Subscription non trouvée')
      }

      // Réactiver le compte
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'ACTIVE' }
      })

      await prisma.clientAccount.update({
        where: { id: subscription.clientAccountId },
        data: { status: 'ACTIVE' }
      })

      // Envoyer notification de réactivation
      await EmailService.sendPaymentConfirmation(
        subscription.clientAccount.user.email,
        subscription.clientAccount.user.firstName,
        subscription.clientAccount.company.name,
        subscription.plan,
        `${subscription.amount} ${subscription.currency}`
      )

      console.log(`✅ Compte réactivé: ${subscription.clientAccount.user.email}`)
    } catch (error) {
      console.error('Erreur réactivation compte:', error)
      throw error
    }
  }

  /**
   * Obtenir le price ID Stripe selon le plan
   */
  private static getPriceIdForPlan(plan: string): string | null {
    const priceMap: Record<string, string> = {
      'SMALL_BUDGET': process.env.STRIPE_PRICE_SMALL_BUDGET!,
      'MEDIUM_BUDGET': process.env.STRIPE_PRICE_MEDIUM_BUDGET!,
      'LARGE_BUDGET': process.env.STRIPE_PRICE_LARGE_BUDGET!
    }

    return priceMap[plan] || null
  }

  /**
   * Générer une facture PDF
   */
  static async generateInvoicePdf(invoiceId: string) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          clientAccount: {
            include: {
              user: true,
              company: true
            }
          }
        }
      })

      if (!invoice) {
        throw new Error('Facture non trouvée')
      }

      // Ici on pourrait intégrer un service de génération PDF
      // Pour l'instant, on retourne l'URL Stripe si disponible
      return invoice.invoicePdfUrl || invoice.invoiceUrl
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      throw error
    }
  }
} 