import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { plan, clientAccountId } = body as { plan?: string; clientAccountId?: string }

    const validPlans = ['SMALL_BUDGET', 'MEDIUM_BUDGET', 'LARGE_BUDGET']
    if (!plan || !validPlans.includes(plan) || !clientAccountId) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
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
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      success_url: `${baseUrl}/client?checkout=success`,
      cancel_url: `${baseUrl}/client/subscribe?checkout=cancelled`,
      customer_email: session.user.email!,
      client_reference_id: clientAccountId,
      metadata: { clientAccountId, plan },
      subscription_data: {
        metadata: { clientAccountId, plan }
      },
      allow_promotion_codes: false
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Erreur création Checkout Session:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la session de paiement' }, { status: 500 })
  }
}