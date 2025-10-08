import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/db"
import { EmailService } from "@/lib/email-service-stub"

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
  apiVersion: "2024-06-20"
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err) {
    console.error("Erreur de signature webhook:", err)
    return NextResponse.json(
      { message: "Erreur de signature" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        await upsertSubscriptionFromStripe(sub, "ACTIVE")
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        await upsertSubscriptionFromStripe(sub, "CANCELLED")
        break
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSuccess(invoice)
        break
      }
      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailure(failedInvoice)
        break
      }
      default:
        console.log(`Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Erreur lors du traitement du webhook:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string | undefined
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
  const clientAccountId = (session.client_reference_id as string | null) || (session.metadata?.clientAccountId as string | undefined)
  const plan = (session.metadata?.plan as string | undefined)
  
  // Récupérer les données CGV depuis les métadonnées
  const cgvAccepted = session.metadata?.cgvAccepted === 'true'
  const cgvVersion = session.metadata?.cgvVersion
  const cgvAcceptedAt = session.metadata?.cgvAcceptedAt

  if (!subscriptionId || !customerId || !clientAccountId || !plan) {
    console.warn('checkout.session.completed: données manquantes', { subscriptionId, customerId, clientAccountId, plan })
    return
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId)

  // Mettre à jour le ClientAccount avec l'acceptation des CGV et marquer l'onboarding comme terminé
  if (clientAccountId) {
    try {
      // Utiliser une requête SQL brute pour éviter les problèmes de types Prisma
      await prisma.$executeRaw`
        UPDATE "ClientAccount" 
        SET "cgvAccepted" = ${cgvAccepted || false}, 
            "cgvVersion" = ${cgvVersion || '1.0'}, 
            "cgvAcceptedAt" = ${cgvAcceptedAt ? new Date(cgvAcceptedAt) : new Date()},
            "onboardingCompleted" = true,
            "subscriptionPlan" = ${plan}
        WHERE id = ${clientAccountId}
      `
      console.log(`✅ Onboarding marqué comme terminé pour le client ${clientAccountId}`)
    } catch (error) {
      console.warn('Erreur lors de la mise à jour ClientAccount:', error)
      // Continue sans échouer si les champs ne sont pas encore disponibles
    }
  }

  const subscription = await prisma.subscription.upsert({
    where: { clientAccountId },
    create: {
      clientAccountId,
      plan,
      status: 'ACTIVE',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: safeStripeTimestamp(sub.current_period_start),
      currentPeriodEnd: safeStripeTimestamp(sub.current_period_end),
      amount: (sub.items.data[0]?.price?.unit_amount ?? 0) / 100,
      currency: (sub.items.data[0]?.price?.currency ?? 'eur').toUpperCase()
    },
    update: {
      plan,
      status: 'ACTIVE',
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: safeStripeTimestamp(sub.current_period_start),
      currentPeriodEnd: safeStripeTimestamp(sub.current_period_end),
      amount: (sub.items.data[0]?.price?.unit_amount ?? 0) / 100,
      currency: (sub.items.data[0]?.price?.currency ?? 'eur').toUpperCase()
    }
  })

  // Envoyer l'email de confirmation de paiement
  try {
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { id: clientAccountId },
      include: { user: true, company: true }
    })

    if (clientAccount && clientAccount.user && clientAccount.company) {
      const amount = `${(sub.items.data[0]?.price?.unit_amount ?? 0) / 100} ${(sub.items.data[0]?.price?.currency ?? 'eur').toUpperCase()}`
      
      await EmailService.sendPaymentConfirmation(
        clientAccount.user.email,
        clientAccount.user.firstName,
        clientAccount.company.name,
        plan,
        amount
      )
    }
  } catch (error) {
    console.error('Erreur envoi email de confirmation de paiement:', error)
    // Ne pas faire échouer le webhook si l'email échoue
  }
}

async function upsertSubscriptionFromStripe(sub: Stripe.Subscription, status: string) {
  const clientAccountId = (sub.metadata?.clientAccountId as string | undefined)
  const plan = (sub.metadata?.plan as string | undefined)

  if (!clientAccountId) return

  await prisma.subscription.upsert({
    where: { clientAccountId },
    create: {
      clientAccountId,
      plan: plan || 'SMALL_BUDGET',
      status,
      stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
      stripeSubscriptionId: sub.id,
      currentPeriodStart: safeStripeTimestamp(sub.current_period_start),
      currentPeriodEnd: safeStripeTimestamp(sub.current_period_end),
      amount: (sub.items.data[0]?.price?.unit_amount ?? 0) / 100,
      currency: (sub.items.data[0]?.price?.currency ?? 'eur').toUpperCase()
    },
    update: {
      plan: plan || undefined,
      status,
      stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
      stripeSubscriptionId: sub.id,
      currentPeriodStart: safeStripeTimestamp(sub.current_period_start),
      currentPeriodEnd: safeStripeTimestamp(sub.current_period_end),
      amount: (sub.items.data[0]?.price?.unit_amount ?? 0) / 100,
      currency: (sub.items.data[0]?.price?.currency ?? 'eur').toUpperCase()
    }
  })
}

async function handleInvoicePaymentSuccess(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: {
        status: "ACTIVE",
        currentPeriodStart: safeStripeTimestamp(invoice.lines?.data[0]?.period?.start),
        currentPeriodEnd: safeStripeTimestamp(invoice.lines?.data[0]?.period?.end),
      }
    })
  }
}

async function handleInvoicePaymentFailure(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: { status: "CANCELLED" }
    })
  }
} 