import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const uptimeSeconds = Math.floor(process.uptime())
    const now = new Date().toISOString()

    return NextResponse.json({
      status: 'ok',
      time: now,
      uptimeSeconds,
      env: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
        hasNextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
        hasStripeKey: Boolean(process.env.STRIPE_SECRET_KEY),
        hasStripeWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        hasResendKey: Boolean(process.env.RESEND_API_KEY),
      }
    })
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
