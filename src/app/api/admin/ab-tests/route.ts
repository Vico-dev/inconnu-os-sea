import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer tous les tests A/B
    const tests = await db.aBTest.findMany({
      include: {
        campaign: true,
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Erreur lors de la récupération des tests A/B:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, campaignId, testType, variants, trafficSplit, duration } = body

    // Validation
    if (!name || !campaignId || !testType || !variants || variants.length < 2) {
      return NextResponse.json(
        { error: 'Données manquantes ou invalides' },
        { status: 400 }
      )
    }

    // Créer le test A/B
    const test = await db.aBTest.create({
      data: {
        name,
        description,
        campaignId,
        testType,
        trafficSplit,
        duration,
        status: 'DRAFT',
        variants: {
          create: variants.map((variant: any, index: number) => ({
            name: variant.name,
            content: variant.content,
            isControl: index === 0
          }))
        }
      },
      include: {
        campaign: true,
        variants: true
      }
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du test A/B:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 