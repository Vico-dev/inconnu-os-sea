import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AIRecommendationsService } from '@/lib/ai-recommendations-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    const industry = searchParams.get('industry')
    const campaignType = searchParams.get('campaignType')

    if (campaignId) {
      // Générer des recommandations pour une campagne spécifique
      const recommendations = await AIRecommendationsService.generateRecommendations(campaignId)
      return NextResponse.json(recommendations)
    }

    if (industry && campaignType) {
      // Générer un benchmark pour un secteur
      const benchmark = await AIRecommendationsService.generateBenchmark(industry, campaignType)
      return NextResponse.json(benchmark)
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
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
    const { type, rule } = body

    if (type === 'alert' && rule) {
      // Créer une nouvelle alerte
      await AIRecommendationsService.createAlert(rule)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Type d\'action non supporté' }, { status: 400 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'alerte:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 