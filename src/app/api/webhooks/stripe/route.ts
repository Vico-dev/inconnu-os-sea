import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { EmailService } from '@/lib/email-service'

// Utilitaire pour convertir les timestamps Stripe de manière sécurisée
function safeStripeTimestamp(timestamp: number | undefined | null): Date | undefined {
  if (!timestamp || typeof timestamp !== 'number' || timestamp <= 0) {
    return undefined
  }
  
  const date = new Date(timestamp * 1000)
  if (isNaN(date.getTime())) {
    console.warn('Timestamp Stripe invalide:', timestamp)
    return undefined
  }
  
  return date
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error: any) {
      console.error('Erreur signature webhook:', error.message)
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
    }

    console.log('🔔 Webhook Stripe reçu:', event.type)

    // Traiter les différents types d'événements
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log('Événement non géré:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Erreur webhook Stripe:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('✅ Paiement réussi:', invoice.id)

    // Trouver la subscription correspondante
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
      include: { clientAccount: { include: { user: true, company: true } } }
    })

    if (!subscription) {
      console.error('Subscription non trouvée pour:', invoice.subscription)
      return
    }

    // Mettre à jour la subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: safeStripeTimestamp(invoice.period_start),
        currentPeriodEnd: safeStripeTimestamp(invoice.period_end)
      }
    })

    // Créer l'invoice (sans PDF - géré par PennyLane)
    await prisma.invoice.create({
      data: {
        clientAccountId: subscription.clientAccountId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid / 100, // Convertir en euros
        currency: invoice.currency.toUpperCase(),
        status: 'PAID',
        paidAt: new Date(),
        number: `FACT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        // invoiceUrl et invoicePdfUrl seront mis à jour via webhook PennyLane
      }
    })

    // Envoyer email de confirmation (sans lien facture - sera ajouté via PennyLane)
    try {
      await EmailService.sendPaymentConfirmation(
        subscription.clientAccount.user.email,
        subscription.clientAccount.user.firstName,
        subscription.clientAccount.company.name,
        subscription.plan,
        `${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`,
        undefined // Pas de lien facture pour l'instant
      )
    } catch (emailError) {
      console.error('Erreur envoi email confirmation:', emailError)
    }

  } catch (error) {
    console.error('Erreur traitement paiement réussi:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('❌ Paiement échoué:', invoice.id)

    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: invoice.subscription as string },
      include: { clientAccount: { include: { user: true, company: true } } }
    })

    if (!subscription) {
      console.error('Subscription non trouvée pour:', invoice.subscription)
      return
    }

    // Mettre à jour le statut
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'PAST_DUE' }
    })

    // Créer l'invoice échoué
    await prisma.invoice.create({
      data: {
        clientAccountId: subscription.clientAccountId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_due / 100,
        currency: invoice.currency.toUpperCase(),
        status: 'FAILED',
        failedAt: new Date(),
        failureReason: invoice.last_finalization_error?.message || 'Paiement refusé'
      }
    })

    // Envoyer notification d'échec
    try {
      await EmailService.sendBillingReminder(
        subscription.clientAccount.user.email,
        subscription.clientAccount.user.firstName,
        subscription.clientAccount.company.name,
        subscription.plan,
        `${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}`,
        safeStripeTimestamp(invoice.due_date)?.toISOString() || new Date().toISOString()
      )
    } catch (emailError) {
      console.error('Erreur envoi email échec:', emailError)
    }

  } catch (error) {
    console.error('Erreur traitement paiement échoué:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('🆕 Subscription créée:', subscription.id)

    // Trouver le client account
    const clientAccount = await prisma.clientAccount.findFirst({
      where: { stripeCustomerId: subscription.customer as string }
    })

    if (!clientAccount) {
      console.error('Client account non trouvé pour:', subscription.customer)
      return
    }

    // Mettre à jour la subscription
    await prisma.subscription.update({
      where: { clientAccountId: clientAccount.id },
      data: {
        stripeSubscriptionId: subscription.id,
        status: subscription.status.toUpperCase(),
        currentPeriodStart: safeStripeTimestamp(subscription.current_period_start),
        currentPeriodEnd: safeStripeTimestamp(subscription.current_period_end)
      }
    })

  } catch (error) {
    console.error('Erreur traitement subscription créée:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('🔄 Subscription mise à jour:', subscription.id)

    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    })

    if (!dbSubscription) {
      console.error('Subscription non trouvée pour:', subscription.id)
      return
    }

    // Mettre à jour la subscription
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: subscription.status.toUpperCase(),
        currentPeriodStart: safeStripeTimestamp(subscription.current_period_start),
        currentPeriodEnd: safeStripeTimestamp(subscription.current_period_end)
      }
    })

  } catch (error) {
    console.error('Erreur traitement subscription mise à jour:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('🗑️ Subscription supprimée:', subscription.id)

    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id }
    })

    if (!dbSubscription) {
      console.error('Subscription non trouvée pour:', subscription.id)
      return
    }

    // Marquer comme annulée
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: { 
        status: 'CANCELLED',
        endDate: new Date()
      }
    })

  } catch (error) {
    console.error('Erreur traitement subscription supprimée:', error)
  }
} 