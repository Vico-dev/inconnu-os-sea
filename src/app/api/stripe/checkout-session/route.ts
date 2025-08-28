import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const PLAN_TO_PRICE_ENV: Record<string, string> = {
  SMALL_BUDGET: process.env.STRIPE_PRICE_SMALL_BUDGET || '',
  MEDIUM_BUDGET: process.env.STRIPE_PRICE_MEDIUM_BUDGET || '',
  LARGE_BUDGET: process.env.STRIPE_PRICE_LARGE_BUDGET || ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, clientAccountId, cgv } = body as { plan?: string; clientAccountId?: string; cgv?: { accepted?: boolean; version?: string; acceptedAt?: string } }

    const validPlans = ['SMALL_BUDGET', 'MEDIUM_BUDGET', 'LARGE_BUDGET']
    if (!plan || !validPlans.includes(plan) || !clientAccountId) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    // Récupérer l'email via clientAccountId
    const clientAccount = await db.clientAccount.findUnique({
      where: { id: clientAccountId },
      include: { user: true }
    })

    if (!clientAccount?.user?.email) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    const priceId = PLAN_TO_PRICE_ENV[plan]
    if (!priceId) {
      return NextResponse.json({ error: `Price ID manquant pour ${plan}` }, { status: 500 })
    }

    // Base URL fiable pour Stripe
    const envUrl = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN
    let baseUrl = envUrl && envUrl.length > 0 ? envUrl : request.nextUrl.origin
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      ui_mode: 'embedded',
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      // Embedded Checkout utilise return_url
      return_url: `${baseUrl}/client?checkout=success`,
      customer_email: clientAccount.user.email,
      client_reference_id: clientAccountId,
      metadata: { clientAccountId, plan, cgvAccepted: cgv?.accepted ? 'true' : 'false', cgvVersion: cgv?.version || 'v1', cgvAcceptedAt: cgv?.acceptedAt || '' },
      subscription_data: {
        metadata: { clientAccountId, plan, cgvAccepted: cgv?.accepted ? 'true' : 'false', cgvVersion: cgv?.version || 'v1', cgvAcceptedAt: cgv?.acceptedAt || '' }
      },
      allow_promotion_codes: false
    })

    // Retourner le client_secret pour Embedded Checkout
    if (checkoutSession.client_secret) {
      return NextResponse.json({ clientSecret: checkoutSession.client_secret })
    }

    // Fallback (au cas où): URL classique
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Erreur création Checkout Session:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la session de paiement' }, { status: 500 })
  }
}