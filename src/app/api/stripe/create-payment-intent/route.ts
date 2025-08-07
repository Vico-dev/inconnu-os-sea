import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20"
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "eur", paymentMethod, planId, userId } = await request.json()

    if (!amount || !paymentMethod || !planId || !userId) {
      return NextResponse.json(
        { message: "Données manquantes" },
        { status: 400 }
      )
    }

    // Créer un PaymentIntent avec les options de paiement appropriées
    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        planId,
        paymentMethod
      }
    }

    // Ajouter les options spécifiques selon le mode de paiement
    if (paymentMethod === "card") {
      paymentIntentData.payment_method_types = ["card"]
    } else if (paymentMethod === "sepa") {
      paymentIntentData.payment_method_types = ["sepa_debit"]
      paymentIntentData.setup_future_usage = "off_session" // Pour les prélèvements futurs
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error("Erreur lors de la création du PaymentIntent:", error)
    return NextResponse.json(
      { message: "Erreur lors de la création du paiement" },
      { status: 500 }
    )
  }
} 