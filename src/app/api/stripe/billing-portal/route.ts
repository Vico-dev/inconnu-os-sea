import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le compte client et l'abonnement pour obtenir le stripeCustomerId
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: user.id },
      include: { subscription: true }
    })

    const customerId = clientAccount?.subscription?.stripeCustomerId
    if (!customerId) {
      return NextResponse.json({ error: 'Client Stripe introuvable' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || request.nextUrl.origin

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/client`
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Erreur création Billing Portal:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du portail' }, { status: 500 })
  }
}