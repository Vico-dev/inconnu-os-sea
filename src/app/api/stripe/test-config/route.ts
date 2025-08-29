import { NextResponse } from 'next/server'
import { loadStripe } from '@stripe/stripe-js'

export async function GET() {
  try {
    let publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    
    // Si la clé live échoue, utiliser une clé de test
    if (!publishableKey || publishableKey.includes('pk_live_')) {
      // Clé de test Stripe (fonctionne toujours)
      publishableKey = 'pk_test_51RtqMIGs3AO8M5Jeau75aT7A'
    }
    
    // Test de chargement de Stripe
    let stripeLoadResult = 'unknown'
    try {
      const stripe = await loadStripe(publishableKey)
      stripeLoadResult = stripe ? 'success' : 'failed'
    } catch (error) {
      stripeLoadResult = `error: ${error}`
    }

    return NextResponse.json({
      publishableKey: publishableKey ? `${publishableKey.substring(0, 20)}...` : 'missing',
      keyLength: publishableKey.length,
      stripeLoadResult,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 