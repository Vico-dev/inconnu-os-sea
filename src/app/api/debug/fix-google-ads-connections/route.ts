import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const results: string[] = []

    // Liste des colonnes attendues pour google_ads_connections (prod peut être en retard)
    const alters = [
      `ALTER TABLE google_ads_connections ADD COLUMN IF NOT EXISTS "customerId" TEXT`,
      `ALTER TABLE google_ads_connections ADD COLUMN IF NOT EXISTS "customerName" TEXT`,
      `ALTER TABLE google_ads_connections ADD COLUMN IF NOT EXISTS "accessToken" TEXT`,
      `ALTER TABLE google_ads_connections ADD COLUMN IF NOT EXISTS "refreshToken" TEXT`,
      `ALTER TABLE google_ads_connections ADD COLUMN IF NOT EXISTS "tokenExpiry" TIMESTAMP`,
      `ALTER TABLE google_ads_connections ADD COLUMN IF NOT EXISTS "isConnected" BOOLEAN DEFAULT false`,
      `ALTER TABLE google_ads_connections ADD COLUMN IF NOT EXISTS "isPrimary" BOOLEAN DEFAULT false`,
      `ALTER TABLE google_ads_connections ADD COLUMN IF NOT EXISTS "connectedAt" TIMESTAMP`
    ]

    for (const sql of alters) {
      try {
        await prisma.$executeRawUnsafe(sql)
        results.push(`OK: ${sql}`)
      } catch (e: any) {
        results.push(`ERR: ${sql} → ${e?.message || e}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'unknown' }, { status: 500 })
  }
}


