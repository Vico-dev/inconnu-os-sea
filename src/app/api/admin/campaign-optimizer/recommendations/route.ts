import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { GoogleAdsService } from '@/lib/google-ads-service'
import { openaiService } from '@/lib/openai-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'utilisateur et ses connexions Google Ads
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { 
        googleAdsConnection: true,
        clientAccount: {
          include: {
            campaigns: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    if (!user?.clientAccount?.campaigns.length) {
      return NextResponse.json({ recommendations: [] })
    }

    // Si l'utilisateur a une connexion Google Ads, récupérer les vraies recommandations
    if (user.googleAdsConnection) {
      try {
        // Récupérer les permissions Google Ads pour ce client
        const permissions = await db.googleAdsPermission.findFirst({
          where: {
            clientAccountId: user.clientAccount.id,
            userId: user.id,
            isActive: true
          }
        })

        if (permissions) {
          const recommendations = await GoogleAdsService.getOptimizationRecommendations(
            permissions.googleAdsCustomerId,
            user.googleAdsConnection.refreshToken || ''
          )

          return NextResponse.json({ recommendations })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des recommandations Google Ads:', error)
        // Fallback vers l'IA si Google Ads échoue
      }
    }

    // Fallback : générer des recommandations IA basées sur les campagnes locales
    const recommendations = await generateAIRecommendations(user.clientAccount.campaigns)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération des recommandations' },
      { status: 500 }
    )
  }
}

async function generateAIRecommendations(campaigns: any[]) {
  try {
    // Analyser les performances des campagnes
    const campaignAnalysis = campaigns.map(campaign => ({
      name: campaign.name,
      type: campaign.type,
      budget: campaign.budget,
      spent: campaign.spent || 0,
      impressions: campaign.impressions || 0,
      clicks: campaign.clicks || 0,
      conversions: campaign.conversions || 0,
      ctr: campaign.ctr || 0,
      cpc: campaign.cpc || 0,
      cpa: campaign.cpa || 0,
      roas: campaign.roas || 0
    }))

    const prompt = `
En tant qu'expert Google Ads, analyse ces campagnes et génère des recommandations d'optimisation :

${JSON.stringify(campaignAnalysis, null, 2)}

Génère 5 recommandations prioritaires au format JSON :
{
  "recommendations": [
    {
      "id": "unique-id",
      "type": "BUDGET|BID|KEYWORD|TARGETING|CREATIVE",
      "priority": "HIGH|MEDIUM|LOW",
      "title": "Titre de la recommandation",
      "description": "Description détaillée",
      "impact": "POSITIVE|NEGATIVE|NEUTRAL",
      "estimatedImprovement": 15,
      "action": "Action à effectuer",
      "applied": false
    }
  ]
}
`

    const response = await openaiService.generateRecommendations({
      prompt,
      campaignType: 'MIXED',
      performanceData: campaignAnalysis
    })

    return response.recommendations.length > 0 
      ? response.recommendations 
      : generateDefaultRecommendations(campaigns)
  } catch (error) {
    console.error('Erreur lors de la génération IA:', error)
    return generateDefaultRecommendations(campaigns)
  }
}

function generateDefaultRecommendations(campaigns: any[]) {
  const recommendations = []
  
  // Recommandations basées sur l'analyse des données
  campaigns.forEach((campaign, index) => {
    if (campaign.ctr < 1) {
      recommendations.push({
        id: `ctr-${index}`,
        type: 'CREATIVE',
        priority: 'HIGH',
        title: 'Améliorer le CTR',
        description: `Le CTR de la campagne "${campaign.name}" est faible (${campaign.ctr.toFixed(2)}%). Testez de nouveaux textes d'annonces.`,
        impact: 'POSITIVE',
        estimatedImprovement: 25,
        action: 'Créer de nouveaux textes d\'annonces',
        applied: false
      })
    }

    if (campaign.cpa > 50) {
      recommendations.push({
        id: `cpa-${index}`,
        type: 'BID',
        priority: 'MEDIUM',
        title: 'Optimiser les enchères',
        description: `Le CPA de la campagne "${campaign.name}" est élevé (${campaign.cpa.toFixed(2)}€). Ajustez les enchères.`,
        impact: 'POSITIVE',
        estimatedImprovement: 15,
        action: 'Réduire les enchères de 20%',
        applied: false
      })
    }

    if (campaign.roas < 2) {
      recommendations.push({
        id: `roas-${index}`,
        type: 'TARGETING',
        priority: 'HIGH',
        title: 'Améliorer le ROAS',
        description: `Le ROAS de la campagne "${campaign.name}" est faible (${campaign.roas.toFixed(2)}x). Affinez le ciblage.`,
        impact: 'POSITIVE',
        estimatedImprovement: 30,
        action: 'Exclure les audiences à faible performance',
        applied: false
      })
    }
  })

  // Recommandations générales
  if (campaigns.length > 0) {
    recommendations.push({
      id: 'budget-optimization',
      type: 'BUDGET',
      priority: 'MEDIUM',
      title: 'Optimisation des budgets',
      description: 'Réallouez les budgets vers les campagnes les plus performantes.',
      impact: 'POSITIVE',
      estimatedImprovement: 20,
      action: 'Augmenter le budget des campagnes ROAS > 3x',
      applied: false
    })
  }

  return recommendations.slice(0, 5) // Limiter à 5 recommandations
} 