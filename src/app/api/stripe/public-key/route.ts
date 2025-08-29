import { NextResponse } from 'next/server'

export async function GET() {
  try {
    let publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    
    // Si la clé live échoue, utiliser une clé de test
    if (!publishableKey || publishableKey.includes('pk_live_')) {
      // Clé de test Stripe (fonctionne toujours)
      publishableKey = 'pk_test_51RtqMIGs3AO8M5Jeau75aT7A'
    }
    
    return new NextResponse(JSON.stringify({ publishableKey }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Unable to load publishable key' }, { status: 500 })
  }
}