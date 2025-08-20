import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'unknown',
      email: 'unknown',
      variables: {
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'MISSING',
        RESEND_FROM: process.env.RESEND_FROM || 'NOT_SET'
      }
    }

    // Test base de données
    try {
      await prisma.$queryRaw`SELECT 1`
      status.database = 'connected'
    } catch (dbError) {
      status.database = 'error'
      status.dbError = dbError instanceof Error ? dbError.message : 'Unknown error'
    }

    // Test email service
    try {
      const { EmailService } = await import('@/lib/email-service')
      status.email = 'available'
    } catch (emailError) {
      status.email = 'error'
      status.emailError = emailError instanceof Error ? emailError.message : 'Unknown error'
    }

    return NextResponse.json(status)

  } catch (error: any) {
    console.error('Erreur debug status:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    }, { status: 500 })
  }
} 