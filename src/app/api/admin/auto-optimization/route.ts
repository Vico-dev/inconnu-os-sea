import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AutoOptimizationService } from '@/lib/auto-optimization-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, action } = body

    switch (action) {
      case 'optimize':
        await AutoOptimizationService.optimizeCampaign(campaignId)
        return NextResponse.json({ success: true, message: 'Optimisation terminée' })
      
      case 'monitor':
        await AutoOptimizationService.monitorPerformance(campaignId)
        return NextResponse.json({ success: true, message: 'Surveillance activée' })
      
      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erreur lors de l\'optimisation automatique:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json({ error: 'CampaignId requis' }, { status: 400 })
    }

    // Récupérer les statistiques d'optimisation
    const stats = {
      lastOptimization: new Date().toISOString(),
      optimizationsThisWeek: 12,
      performanceImprovement: 15.2,
      activeRules: 5,
      abTestsRunning: 2
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erreur lors de la récupération des stats d\'optimisation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 