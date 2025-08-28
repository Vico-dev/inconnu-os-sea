import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
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