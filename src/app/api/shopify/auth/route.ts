import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShopifyService } from '@/lib/shopify-service'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Intégration Shopify temporairement désactivée - Configuration en cours" },
    { status: 503 }
  )
} 