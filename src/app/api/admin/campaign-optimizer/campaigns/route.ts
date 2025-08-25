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
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    if (!user?.clientAccount) {
      return NextResponse.json({ campaigns: [] })
    }

    // Si l'utilisateur a une connexion Google Ads, récupérer les vraies données
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
          const googleAdsCampaigns = await GoogleAdsService.getCampaigns(
            permissions.googleAdsCustomerId,
            user.googleAdsConnection.refreshToken || ''
          )

          // Transformer les données Google Ads pour l'interface
          const campaigns = googleAdsCampaigns.map(campaign => ({
            id: campaign.id,
            name: campaign.name,
            type: campaign.type,
            status: campaign.status,
            budget: campaign.budget,
            spent: campaign.cost,
            impressions: campaign.impressions,
            clicks: campaign.clicks,
            conversions: campaign.conversions,
            ctr: campaign.ctr,
            cpc: campaign.cpc,
            cpa: campaign.cpa,
            roas: campaign.roas,
            score: campaign.optimizationScore || 50,
            lastOptimized: campaign.lastOptimized || new Date().toISOString()
          }))

          return NextResponse.json({ campaigns })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données Google Ads:', error)
        // Fallback vers les données locales si Google Ads échoue
      }
    }

    // Fallback : utiliser les données locales
    const campaigns = user.clientAccount.campaigns.map((campaign: any) => {
      const metrics = campaign.metrics ? JSON.parse(campaign.metrics) : {}
      
      return {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        budget: campaign.budget || 0,
        spent: metrics.spent || 0,
        impressions: metrics.impressions || 0,
        clicks: metrics.clicks || 0,
        conversions: metrics.conversions || 0,
        ctr: metrics.ctr || 0,
        cpc: metrics.cpc || 0,
        cpa: metrics.cpa || 0,
        roas: metrics.roas || 0,
        score: metrics.optimizationScore || 50,
        lastOptimized: metrics.lastOptimized || new Date().toISOString()
      }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Erreur lors de la récupération des campagnes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des campagnes' },
      { status: 500 }
    )
  }
} 