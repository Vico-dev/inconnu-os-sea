import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const {
      gtin,
      language = 'fr',
      originalTitle,
      originalDescription,
      originalPublicPrice,
      originalCurrency = 'EUR',
      aiTitle,
      aiDescription,
      aiPublicPrice,
      status = 'DRAFT',
      notes
    } = body || {}

    if (!gtin) {
      return NextResponse.json({ error: 'gtin requis' }, { status: 400 })
    }

    // Récupérer le clientAccount de l'utilisateur courant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { clientAccount: true }
    })

    if (!user?.clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    const data = {
      clientAccountId: user.clientAccount.id,
      gtin: String(gtin),
      language,
      originalTitle: originalTitle ?? undefined,
      originalDescription: originalDescription ?? undefined,
      originalPublicPrice: typeof originalPublicPrice === 'number' ? originalPublicPrice : undefined,
      originalCurrency,
      aiTitle: aiTitle ?? undefined,
      aiDescription: aiDescription ?? undefined,
      aiPublicPrice: typeof aiPublicPrice === 'number' ? aiPublicPrice : undefined,
      status,
      notes: notes ?? undefined,
      source: 'AI' as const
    }

    const optimization = await prisma.productOptimization.upsert({
      where: {
        clientAccountId_gtin_language: {
          clientAccountId: user.clientAccount.id,
          gtin: String(gtin),
          language
        }
      },
      create: data,
      update: data
    })

    return NextResponse.json({ success: true, optimization })
  } catch (error) {
    console.error('Erreur sauvegarde optimisation:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { gtin, language = 'fr', status, aiTitle, aiDescription, aiPublicPrice, notes } = body || {}

    if (!gtin) {
      return NextResponse.json({ error: 'gtin requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { clientAccount: true }
    })

    if (!user?.clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    const optimization = await prisma.productOptimization.update({
      where: {
        clientAccountId_gtin_language: {
          clientAccountId: user.clientAccount.id,
          gtin: String(gtin),
          language
        }
      },
      data: {
        status: status ?? undefined,
        aiTitle: aiTitle ?? undefined,
        aiDescription: aiDescription ?? undefined,
        aiPublicPrice: typeof aiPublicPrice === 'number' ? aiPublicPrice : undefined,
        notes: notes ?? undefined
      }
    })

    return NextResponse.json({ success: true, optimization })
  } catch (error) {
    console.error('Erreur mise à jour optimisation:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}


