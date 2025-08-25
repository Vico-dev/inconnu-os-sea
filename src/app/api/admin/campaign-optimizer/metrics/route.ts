import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { GoogleAdsService } from '@/lib/google-ads-service'

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
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    })

    if (!user?.clientAccount) {
      return NextResponse.json({
        metrics: {
          totalSpent: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          averageCtr: 0,
          averageCpc: 0,
          averageCpa: 0,
          averageRoas: 0,
          optimizationScore: 0
        }
      })
    }

    // Si l'utilisateur a une connexion Google Ads, récupérer les vraies métriques
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
          const accountMetrics = await GoogleAdsService.getAccountMetrics(
            permissions.googleAdsCustomerId,
            user.googleAdsConnection.refreshToken || ''
          )

          return NextResponse.json({ metrics: accountMetrics })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des métriques Google Ads:', error)
        // Fallback vers les données locales si Google Ads échoue
      }
    }

    // Fallback : calculer les métriques à partir des campagnes locales
    const campaigns = user.clientAccount.campaigns

    // Calculer les métriques globales
    const totalSpent = campaigns.reduce((sum, campaign) => {
      const metrics = campaign.metrics ? JSON.parse(campaign.metrics) : {}
      return sum + (metrics.spent || 0)
    }, 0)
    
    const totalImpressions = campaigns.reduce((sum, campaign) => {
      const metrics = campaign.metrics ? JSON.parse(campaign.metrics) : {}
      return sum + (metrics.impressions || 0)
    }, 0)
    
    const totalClicks = campaigns.reduce((sum, campaign) => {
      const metrics = campaign.metrics ? JSON.parse(campaign.metrics) : {}
      return sum + (metrics.clicks || 0)
    }, 0)
    
    const totalConversions = campaigns.reduce((sum, campaign) => {
      const metrics = campaign.metrics ? JSON.parse(campaign.metrics) : {}
      return sum + (metrics.conversions || 0)
    }, 0)

    // Calculer les moyennes
    const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const averageCpc = totalClicks > 0 ? totalSpent / totalClicks : 0
    const averageCpa = totalConversions > 0 ? totalSpent / totalConversions : 0
    
    // Calculer le ROAS moyen (revenus / dépenses)
    const totalRevenue = campaigns.reduce((sum, campaign) => {
      const metrics = campaign.metrics ? JSON.parse(campaign.metrics) : {}
      const revenue = (metrics.spent || 0) * (metrics.roas || 0)
      return sum + revenue
    }, 0)
    const averageRoas = totalSpent > 0 ? totalRevenue / totalSpent : 0

    // Calculer le score d'optimisation global
    const optimizationScore = calculateOptimizationScore(campaigns)

    const metrics = {
      totalSpent,
      totalImpressions,
      totalClicks,
      totalConversions,
      averageCtr,
      averageCpc,
      averageCpa,
      averageRoas,
      optimizationScore
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Erreur lors du calcul des métriques:', error)
    return NextResponse.json(
      { error: 'Erreur lors du calcul des métriques' },
      { status: 500 }
    )
  }
}

function calculateOptimizationScore(campaigns: any[]): number {
  if (campaigns.length === 0) return 0

  let totalScore = 0
  let validCampaigns = 0

  campaigns.forEach(campaign => {
    let campaignScore = 50 // Score de base

    // Récupérer les métriques depuis le JSON
    const metrics = campaign.metrics ? JSON.parse(campaign.metrics) : {}
    
    // Facteurs d'optimisation
    const ctr = metrics.ctr || 0
    const cpa = metrics.cpa || 0
    const roas = metrics.roas || 0
    const spent = metrics.spent || 0

    // Score basé sur le CTR
    if (ctr > 2) campaignScore += 15
    else if (ctr > 1) campaignScore += 10
    else if (ctr > 0.5) campaignScore += 5
    else campaignScore -= 10

    // Score basé sur le CPA
    if (cpa < 20) campaignScore += 15
    else if (cpa < 50) campaignScore += 10
    else if (cpa < 100) campaignScore += 5
    else campaignScore -= 10

    // Score basé sur le ROAS
    if (roas > 4) campaignScore += 20
    else if (roas > 2) campaignScore += 15
    else if (roas > 1) campaignScore += 10
    else campaignScore -= 15

    // Score basé sur l'utilisation du budget
    if (spent > 0 && campaign.budget) {
      const budgetUtilization = (spent / campaign.budget) * 100
      if (budgetUtilization > 80) campaignScore += 10
      else if (budgetUtilization > 50) campaignScore += 5
      else campaignScore -= 5
    }

    // Limiter le score entre 0 et 100
    campaignScore = Math.max(0, Math.min(100, campaignScore))
    
    totalScore += campaignScore
    validCampaigns++
  })

  return validCampaigns > 0 ? Math.round(totalScore / validCampaigns) : 0
} 