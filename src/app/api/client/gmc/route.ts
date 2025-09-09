import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Cherche le compte client lié à l'utilisateur
  const account = await prisma.clientAccount.findUnique({
    where: { userId: session.user.id },
    select: { merchantCenterMerchantId: true }
  })

  return NextResponse.json({
    success: true,
    merchantId: account?.merchantCenterMerchantId || null
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { merchantId } = await req.json()
  if (!merchantId || typeof merchantId !== 'string') {
    return NextResponse.json({ error: 'merchantId requis' }, { status: 400 })
  }

  // Upsert du merchantId dans le compte client
  const existing = await prisma.clientAccount.findUnique({ where: { userId: session.user.id }, select: { id: true } })
  if (!existing) {
    return NextResponse.json({ error: 'Compte client introuvable' }, { status: 404 })
  }

  await prisma.clientAccount.update({
    where: { id: existing.id },
    data: { merchantCenterMerchantId: merchantId }
  })

  return NextResponse.json({ success: true })
}