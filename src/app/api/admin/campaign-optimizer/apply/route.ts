import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { GoogleAdsService } from '@/lib/google-ads-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { recommendationId } = body

    // Récupérer l'utilisateur et ses campagnes
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { 
        clientAccount: {
          include: {
            campaigns: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    if (!user?.clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    // Appliquer l'optimisation basée sur le type de recommandation
    const result = await applyOptimization(recommendationId, user.clientAccount.campaigns)

    // Mettre à jour la campagne dans la base de données
    if (result.success && result.campaignId) {
      await db.campaign.update({
        where: { id: result.campaignId },
        data: {
          lastOptimized: new Date(),
          optimizationScore: result.newScore || 50
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Optimisation appliquée avec succès',
      result
    })
  } catch (error) {
    console.error('Erreur lors de l\'application de l\'optimisation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'application de l\'optimisation' },
      { status: 500 }
    )
  }
}

async function applyOptimization(recommendationId: string, campaigns: any[]) {
  // Simuler l'application d'optimisations basées sur l'ID de recommandation
  const optimizationType = recommendationId.split('-')[0]
  
  switch (optimizationType) {
    case 'ctr':
      return await applyCTROptimization(campaigns)
    case 'cpa':
      return await applyCPAOptimization(campaigns)
    case 'roas':
      return await applyROASOptimization(campaigns)
    case 'budget':
      return await applyBudgetOptimization(campaigns)
    default:
      return {
        success: true,
        message: 'Optimisation générique appliquée',
        campaignId: campaigns[0]?.id,
        newScore: 60
      }
  }
}

async function applyCTROptimization(campaigns: any[]) {
  // Optimisation du CTR - ajuster les enchères et améliorer les annonces
  const campaign = campaigns[0] // Prendre la première campagne pour l'exemple
  
  try {
    // Appel à l'API Google Ads pour ajuster les enchères
    if (campaign.googleAdsCampaignId) {
      await GoogleAdsService.adjustBids({
        campaignId: campaign.googleAdsCampaignId,
        adjustment: -0.1, // Réduire les enchères de 10%
        reason: 'CTR optimization'
      })
    }

    return {
      success: true,
      message: 'Enchères ajustées pour améliorer le CTR',
      campaignId: campaign.id,
      newScore: Math.min(100, (campaign.optimizationScore || 50) + 10)
    }
  } catch (error) {
    console.error('Erreur lors de l\'optimisation CTR:', error)
    return {
      success: false,
      message: 'Erreur lors de l\'optimisation CTR',
      campaignId: campaign.id
    }
  }
}

async function applyCPAOptimization(campaigns: any[]) {
  // Optimisation du CPA - ajuster les enchères et le ciblage
  const campaign = campaigns[0]
  
  try {
    if (campaign.googleAdsCampaignId) {
      await GoogleAdsService.adjustBids({
        campaignId: campaign.googleAdsCampaignId,
        adjustment: -0.2, // Réduire les enchères de 20%
        reason: 'CPA optimization'
      })
    }

    return {
      success: true,
      message: 'Enchères réduites pour optimiser le CPA',
      campaignId: campaign.id,
      newScore: Math.min(100, (campaign.optimizationScore || 50) + 15)
    }
  } catch (error) {
    console.error('Erreur lors de l\'optimisation CPA:', error)
    return {
      success: false,
      message: 'Erreur lors de l\'optimisation CPA',
      campaignId: campaign.id
    }
  }
}

async function applyROASOptimization(campaigns: any[]) {
  // Optimisation du ROAS - améliorer le ciblage et les audiences
  const campaign = campaigns[0]
  
  try {
    if (campaign.googleAdsCampaignId) {
      // Ajouter des audiences similaires
      await GoogleAdsService.addSimilarAudiences({
        campaignId: campaign.googleAdsCampaignId,
        audienceType: 'SIMILAR'
      })
    }

    return {
      success: true,
      message: 'Audiences similaires ajoutées pour améliorer le ROAS',
      campaignId: campaign.id,
      newScore: Math.min(100, (campaign.optimizationScore || 50) + 20)
    }
  } catch (error) {
    console.error('Erreur lors de l\'optimisation ROAS:', error)
    return {
      success: false,
      message: 'Erreur lors de l\'optimisation ROAS',
      campaignId: campaign.id
    }
  }
}

async function applyBudgetOptimization(campaigns: any[]) {
  // Optimisation des budgets - réallouer vers les campagnes performantes
  const highPerformingCampaigns = campaigns.filter(c => (c.roas || 0) > 2)
  const lowPerformingCampaigns = campaigns.filter(c => (c.roas || 0) <= 2)
  
  try {
    // Augmenter le budget des campagnes performantes
    for (const campaign of highPerformingCampaigns) {
      if (campaign.googleAdsCampaignId) {
        await GoogleAdsService.adjustBudget({
          campaignId: campaign.googleAdsCampaignId,
          newBudget: campaign.budget * 1.2 // Augmenter de 20%
        })
      }
    }

    // Réduire le budget des campagnes peu performantes
    for (const campaign of lowPerformingCampaigns) {
      if (campaign.googleAdsCampaignId) {
        await GoogleAdsService.adjustBudget({
          campaignId: campaign.googleAdsCampaignId,
          newBudget: campaign.budget * 0.8 // Réduire de 20%
        })
      }
    }

    return {
      success: true,
      message: 'Budgets réalloués vers les campagnes performantes',
      campaignId: campaigns[0]?.id,
      newScore: Math.min(100, (campaigns[0]?.optimizationScore || 50) + 25)
    }
  } catch (error) {
    console.error('Erreur lors de l\'optimisation des budgets:', error)
    return {
      success: false,
      message: 'Erreur lors de l\'optimisation des budgets',
      campaignId: campaigns[0]?.id
    }
  }
} 