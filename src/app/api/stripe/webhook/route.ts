import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/db"

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
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(failedPayment)
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSuccess(invoice)
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailure(failedInvoice)
        break

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

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { userId, planId, paymentMethod } = paymentIntent.metadata

  // Mettre à jour l'abonnement
  await prisma.subscription.updateMany({
    where: {
      clientAccount: {
        userId: userId
      }
    },
    data: {
      status: "ACTIVE",
      stripeSubscriptionId: paymentIntent.id,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      amount: paymentIntent.amount / 100
    }
  })

  console.log(`Paiement réussi pour l'utilisateur ${userId}, plan ${planId}`)
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { userId } = paymentIntent.metadata

  // Mettre à jour l'abonnement en échec
  await prisma.subscription.updateMany({
    where: {
      clientAccount: {
        userId: userId
      }
    },
    data: {
      status: "CANCELLED"
    }
  })

  console.log(`Paiement échoué pour l'utilisateur ${userId}`)
}

async function handleInvoicePaymentSuccess(invoice: Stripe.Invoice) {
  // Gérer les paiements récurrents
  if (invoice.subscription) {
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: invoice.subscription as string
      },
      data: {
        status: "ACTIVE",
        currentPeriodStart: new Date(invoice.period_start * 1000),
        currentPeriodEnd: new Date(invoice.period_end * 1000)
      }
    })
  }
}

async function handleInvoicePaymentFailure(invoice: Stripe.Invoice) {
  // Gérer les échecs de paiement récurrents
  if (invoice.subscription) {
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: invoice.subscription as string
      },
      data: {
        status: "CANCELLED"
      }
    })
  }
} 