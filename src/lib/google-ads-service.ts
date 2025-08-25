import { GoogleAdsApi, Customer } from 'google-ads-api'

export interface GoogleAdsConfig {
  clientId: string
  clientSecret: string
  developerToken: string
  redirectUri: string
}

export interface GoogleAdsAccount {
  customerId: string
  customerName: string
  managerLinkId?: string
  testAccount: boolean
}

export interface CampaignData {
  id: string
  name: string
  status: string
  type: string
  budget: number
  budgetType: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
  cpa: number
  roas: number
  startDate: string
  endDate?: string
  optimizationScore?: number
  lastOptimized?: string
}

export interface AccountMetrics {
  totalImpressions: number
  totalClicks: number
  totalCost: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  averageCpa: number
  averageRoas: number
  totalCampaigns: number
  activeCampaigns: number
  optimizationScore: number
}

export interface OptimizationRecommendation {
  id: string
  type: 'BUDGET' | 'BID' | 'KEYWORD' | 'TARGETING' | 'CREATIVE'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  estimatedImprovement: number
  action: string
  applied: boolean
  campaignId?: string
}

export class GoogleAdsService {
  private static client: GoogleAdsApi | null = null

  static initialize() {
    if (!this.client) {
      this.client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      })
    }
    return this.client
  }

  static createCustomer(customerId: string, refreshToken: string): Customer {
    const client = this.initialize()
    return client.Customer({
      customer_id: customerId,
      refresh_token: refreshToken,
    })
  }

  static async getCampaigns(customerId: string, refreshToken: string): Promise<CampaignData[]> {
    try {
      const customer = this.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.bidding_strategy_type,
          campaign.start_date,
          campaign.end_date,
          campaign_budget.amount_micros,
          campaign_budget.delivery_method,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm,
          metrics.average_cpa,
          metrics.value_per_all_conversions,
          metrics.all_conversions_value
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `

      const response = await customer.query(query)
      
      return response.map((row: any) => {
        const cost = parseFloat(row.metrics.costMicros) / 1000000 || 0
        const conversions = parseFloat(row.metrics.conversions) || 0
        const conversionValue = parseFloat(row.metrics.allConversionsValue) || 0
        
        // Calculer le ROAS
        const roas = cost > 0 ? conversionValue / cost : 0
        
        // Calculer le CPA
        const cpa = conversions > 0 ? cost / conversions : 0
        
        // Calculer le score d'optimisation
        const optimizationScore = this.calculateOptimizationScore({
          ctr: parseFloat(row.metrics.ctr) || 0,
          cpa,
          roas,
          cost,
          budget: parseFloat(row.campaignBudget.amountMicros) / 1000000 || 0
        })

        return {
          id: row.campaign.id,
          name: row.campaign.name,
          status: row.campaign.status,
          type: row.campaign.advertisingChannelType || 'UNKNOWN',
          budget: parseFloat(row.campaignBudget.amountMicros) / 1000000 || 0,
          budgetType: row.campaignBudget.deliveryMethod || 'STANDARD',
          impressions: parseInt(row.metrics.impressions) || 0,
          clicks: parseInt(row.metrics.clicks) || 0,
          cost,
          conversions,
          ctr: parseFloat(row.metrics.ctr) || 0,
          cpc: parseFloat(row.metrics.averageCpc) / 1000000 || 0,
          cpm: parseFloat(row.metrics.averageCpm) / 1000000 || 0,
          cpa,
          roas,
          startDate: row.campaign.startDate,
          endDate: row.campaign.endDate,
          optimizationScore,
          lastOptimized: new Date().toISOString() // À remplacer par la vraie date
        }
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des campagnes:', error)
      throw error
    }
  }

  static async getAccountMetrics(customerId: string, refreshToken: string): Promise<AccountMetrics> {
    try {
      const campaigns = await this.getCampaigns(customerId, refreshToken)
      
      const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0)
      const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0)
      const totalCost = campaigns.reduce((sum, campaign) => sum + campaign.cost, 0)
      const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0)
      const totalRevenue = campaigns.reduce((sum, campaign) => sum + (campaign.cost * campaign.roas), 0)
      
      const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ENABLED').length
      
      const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
      const averageCpc = totalClicks > 0 ? totalCost / totalClicks : 0
      const averageCpm = totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0
      const averageCpa = totalConversions > 0 ? totalCost / totalConversions : 0
      const averageRoas = totalCost > 0 ? totalRevenue / totalCost : 0
      
      // Calculer le score d'optimisation global
      const optimizationScore = campaigns.length > 0 
        ? Math.round(campaigns.reduce((sum, campaign) => sum + (campaign.optimizationScore || 50), 0) / campaigns.length)
        : 0
      
      return {
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions,
        averageCtr,
        averageCpc,
        averageCpm,
        averageCpa,
        averageRoas,
        totalCampaigns: campaigns.length,
        activeCampaigns,
        optimizationScore,
      }
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error)
      throw error
    }
  }

  static async getOptimizationRecommendations(customerId: string, refreshToken: string): Promise<OptimizationRecommendation[]> {
    try {
      const campaigns = await this.getCampaigns(customerId, refreshToken)
      const recommendations: OptimizationRecommendation[] = []
      
      campaigns.forEach((campaign, index) => {
        // Recommandations basées sur le CTR
        if (campaign.ctr < 1) {
          recommendations.push({
            id: `ctr-${campaign.id}-${index}`,
            type: 'CREATIVE',
            priority: 'HIGH',
            title: 'Améliorer le CTR',
            description: `Le CTR de la campagne "${campaign.name}" est faible (${campaign.ctr.toFixed(2)}%). Testez de nouveaux textes d'annonces.`,
            impact: 'POSITIVE',
            estimatedImprovement: 25,
            action: 'Créer de nouveaux textes d\'annonces',
            applied: false,
            campaignId: campaign.id
          })
        }

        // Recommandations basées sur le CPA
        if (campaign.cpa > 50) {
          recommendations.push({
            id: `cpa-${campaign.id}-${index}`,
            type: 'BID',
            priority: 'MEDIUM',
            title: 'Optimiser les enchères',
            description: `Le CPA de la campagne "${campaign.name}" est élevé (${campaign.cpa.toFixed(2)}€). Ajustez les enchères.`,
            impact: 'POSITIVE',
            estimatedImprovement: 15,
            action: 'Réduire les enchères de 20%',
            applied: false,
            campaignId: campaign.id
          })
        }

        // Recommandations basées sur le ROAS
        if (campaign.roas < 2) {
          recommendations.push({
            id: `roas-${campaign.id}-${index}`,
            type: 'TARGETING',
            priority: 'HIGH',
            title: 'Améliorer le ROAS',
            description: `Le ROAS de la campagne "${campaign.name}" est faible (${campaign.roas.toFixed(2)}x). Affinez le ciblage.`,
            impact: 'POSITIVE',
            estimatedImprovement: 30,
            action: 'Exclure les audiences à faible performance',
            applied: false,
            campaignId: campaign.id
          })
        }

        // Recommandations basées sur l'utilisation du budget
        if (campaign.cost > 0 && campaign.budget > 0) {
          const budgetUtilization = (campaign.cost / campaign.budget) * 100
          if (budgetUtilization < 50 && campaign.roas > 2) {
            recommendations.push({
              id: `budget-${campaign.id}-${index}`,
              type: 'BUDGET',
              priority: 'MEDIUM',
              title: 'Augmenter le budget',
              description: `La campagne "${campaign.name}" utilise seulement ${budgetUtilization.toFixed(1)}% de son budget avec un ROAS de ${campaign.roas.toFixed(2)}x.`,
              impact: 'POSITIVE',
              estimatedImprovement: 20,
              action: 'Augmenter le budget de 50%',
              applied: false,
              campaignId: campaign.id
            })
          }
        }
      })

      // Recommandations générales
      const highPerformingCampaigns = campaigns.filter(c => c.roas > 3)
      const lowPerformingCampaigns = campaigns.filter(c => c.roas < 1)
      
      if (highPerformingCampaigns.length > 0 && lowPerformingCampaigns.length > 0) {
        recommendations.push({
          id: 'budget-reallocation',
          type: 'BUDGET',
          priority: 'HIGH',
          title: 'Réallocation des budgets',
          description: `${highPerformingCampaigns.length} campagne(s) performante(s) et ${lowPerformingCampaigns.length} campagne(s) peu performante(s) détectées.`,
          impact: 'POSITIVE',
          estimatedImprovement: 35,
          action: 'Réallouer les budgets vers les campagnes performantes',
          applied: false
        })
      }

      return recommendations.slice(0, 10) // Limiter à 10 recommandations
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error)
      throw error
    }
  }

  static async adjustBids(params: { campaignId: string, adjustment: number, reason: string }) {
    try {
      // Simulation pour l'instant - à remplacer par de vrais appels API
      console.log(`Ajustement des enchères pour la campagne ${params.campaignId}: ${params.adjustment * 100}%`)
      return { success: true, message: 'Enchères ajustées' }
    } catch (error) {
      console.error('Erreur lors de l\'ajustement des enchères:', error)
      throw error
    }
  }

  static async adjustBudget(params: { campaignId: string, newBudget: number }) {
    try {
      // Simulation pour l'instant - à remplacer par de vrais appels API
      console.log(`Ajustement du budget pour la campagne ${params.campaignId}: ${params.newBudget}€`)
      return { success: true, message: 'Budget ajusté' }
    } catch (error) {
      console.error('Erreur lors de l\'ajustement du budget:', error)
      throw error
    }
  }

  static async addSimilarAudiences(params: { campaignId: string, audienceType: string }) {
    try {
      // Simulation pour l'instant - à remplacer par de vrais appels API
      console.log(`Ajout d'audiences similaires pour la campagne ${params.campaignId}`)
      return { success: true, message: 'Audiences ajoutées' }
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'audiences:', error)
      throw error
    }
  }

  static async testConnection(customerId: string, refreshToken: string): Promise<boolean> {
    try {
      const customer = this.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT customer.id 
        FROM customer 
        WHERE customer.id = ${customerId}
        LIMIT 1
      `
      
      await customer.query(query)
      return true
    } catch (error) {
      console.error('Erreur de test de connexion:', error)
      return false
    }
  }

  private static calculateOptimizationScore(campaign: {
    ctr: number
    cpa: number
    roas: number
    cost: number
    budget: number
  }): number {
    let score = 50 // Score de base

    // Score basé sur le CTR
    if (campaign.ctr > 2) score += 15
    else if (campaign.ctr > 1) score += 10
    else if (campaign.ctr > 0.5) score += 5
    else score -= 10

    // Score basé sur le CPA
    if (campaign.cpa < 20) score += 15
    else if (campaign.cpa < 50) score += 10
    else if (campaign.cpa < 100) score += 5
    else score -= 10

    // Score basé sur le ROAS
    if (campaign.roas > 4) score += 20
    else if (campaign.roas > 2) score += 15
    else if (campaign.roas > 1) score += 10
    else score -= 15

    // Score basé sur l'utilisation du budget
    if (campaign.cost > 0 && campaign.budget > 0) {
      const budgetUtilization = (campaign.cost / campaign.budget) * 100
      if (budgetUtilization > 80) score += 10
      else if (budgetUtilization > 50) score += 5
      else score -= 5
    }

    return Math.max(0, Math.min(100, score))
  }
} 