import { GoogleAdsApi } from 'google-ads-api'
import { db } from './db'

export interface GoogleAdsMetrics {
  impressions: number
  clicks: number
  conversions: number
  cost: number
  ctr: number
  cpc: number
  conversionRate: number
  roas: number
}

export interface GoogleAdsCampaign {
  id: string
  name: string
  status: string
  type: string
  budget: number
  startDate: string
  endDate?: string
  metrics: GoogleAdsMetrics
}

export interface GoogleAdsAccount {
  customerId: string
  name: string
  status: string
  currency: string
  timeZone: string
}

export class GoogleAdsAPIService {
  private static client: GoogleAdsApi | null = null

  /**
   * Initialise le client Google Ads API
   */
  static initialize() {
    if (!process.env.GOOGLE_ADS_CLIENT_ID || !process.env.GOOGLE_ADS_CLIENT_SECRET) {
      console.warn('⚠️ Variables d\'environnement Google Ads manquantes')
      return false
    }

    try {
      this.client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
      })
      return true
    } catch (error) {
      console.error('Erreur lors de l\'initialisation Google Ads API:', error)
      return false
    }
  }

  /**
   * Crée un nouveau compte Google Ads
   */
  static async createAccount(accountData: {
    customerName: string
    currency: string
    timeZone: string
    billingInfo: {
      name: string
      address: string
      city: string
      postalCode: string
      country: string
    }
  }): Promise<{ customerId: string; resourceName: string }> {
    if (!this.client) {
      throw new Error('Client Google Ads non initialisé')
    }

    try {
      // TODO: Implémenter la création réelle de compte
      // Cette fonction nécessite des permissions spéciales et un processus d'approbation
      console.log('🆕 Création de compte Google Ads:', accountData)
      
      // Simulation pour le moment
      const mockCustomerId = `123${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
      
      return {
        customerId: mockCustomerId,
        resourceName: `customers/${mockCustomerId}`
      }
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error)
      throw error
    }
  }

  /**
   * Récupère les campagnes d'un compte
   */
  static async getCampaigns(customerId: string, accessToken: string): Promise<GoogleAdsCampaign[]> {
    if (!this.client) {
      throw new Error('Client Google Ads non initialisé')
    }

    try {
      const customer = this.client.Customer({
        customer_id: customerId,
        refresh_token: accessToken
      })

      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.start_date,
          campaign.end_date,
          campaign.budget_amount_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc_micros,
          metrics.conversions_from_interactions_rate,
          metrics.value_per_conversion
        FROM campaign 
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.start_date DESC
      `

      const response = await customer.query(query)
      
      return response.map((row: any) => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        type: row.campaign.advertisingChannelType,
        budget: row.campaign.budgetAmountMicros / 1000000,
        startDate: row.campaign.startDate,
        endDate: row.campaign.endDate,
        metrics: {
          impressions: parseInt(row.metrics.impressions) || 0,
          clicks: parseInt(row.metrics.clicks) || 0,
          conversions: parseFloat(row.metrics.conversions) || 0,
          cost: row.metrics.costMicros / 1000000,
          ctr: parseFloat(row.metrics.ctr) || 0,
          cpc: row.metrics.averageCpcMicros / 1000000,
          conversionRate: parseFloat(row.metrics.conversionsFromInteractionsRate) || 0,
          roas: parseFloat(row.metrics.valuePerConversion) || 0
        }
      }))
    } catch (error) {
      console.error('Erreur lors de la récupération des campagnes:', error)
      throw error
    }
  }

  /**
   * Crée une nouvelle campagne
   */
  static async createCampaign(customerId: string, accessToken: string, campaignData: {
    name: string
    type: string
    budget: number
    startDate: string
    endDate?: string
    targetCpa?: number
    keywords?: string[]
    headlines?: string[]
    descriptions?: string[]
  }): Promise<{ campaignId: string; adGroupId: string }> {
    if (!this.client) {
      throw new Error('Client Google Ads non initialisé')
    }

    try {
      const customer = this.client.Customer({
        customer_id: customerId,
        refresh_token: accessToken
      })

      console.log('🆕 Création de campagne Google Ads:', campaignData)

      // 1. Créer le budget de campagne
      const budgetOperation = {
        create: {
          name: `${campaignData.name} - Budget`,
          amount_micros: campaignData.budget * 1000000,
          delivery_method: 'STANDARD'
        }
      }

      const budgetResponse = await customer.campaignBudget.create(budgetOperation)
      const budgetId = budgetResponse.results[0].resource_name.split('/').pop()

      // 2. Créer la campagne
      const campaignOperation = {
        create: {
          name: campaignData.name,
          status: 'ENABLED',
          advertising_channel_type: this.mapCampaignType(campaignData.type),
          campaign_budget: `customers/${customerId}/campaignBudgets/${budgetId}`,
          start_date: campaignData.startDate,
          ...(campaignData.endDate && { end_date: campaignData.endDate }),
          ...(campaignData.targetCpa && {
            target_cpa: {
              target_cpa_micros: campaignData.targetCpa * 1000000
            }
          })
        }
      }

      const campaignResponse = await customer.campaign.create(campaignOperation)
      const campaignId = campaignResponse.results[0].resource_name.split('/').pop()

      // 3. Créer le groupe d'annonces
      const adGroupOperation = {
        create: {
          name: `${campaignData.name} - Groupe Principal`,
          campaign: `customers/${customerId}/campaigns/${campaignId}`,
          status: 'ENABLED',
          type: 'SEARCH_STANDARD'
        }
      }

      const adGroupResponse = await customer.adGroup.create(adGroupOperation)
      const adGroupId = adGroupResponse.results[0].resource_name.split('/').pop()

      // 4. Ajouter les mots-clés si fournis
      if (campaignData.keywords && campaignData.keywords.length > 0) {
        const keywordOperations = campaignData.keywords.map(keyword => ({
          create: {
            ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
            text: keyword,
            match_type: 'BROAD'
          }
        }))

        await customer.adGroupCriterion.create(keywordOperations)
      }

      // 5. Créer les annonces si les textes sont fournis
      if (campaignData.headlines && campaignData.descriptions) {
        const adOperation = {
          create: {
            ad_group: `customers/${customerId}/adGroups/${adGroupId}`,
            type: 'RESPONSIVE_SEARCH_AD',
            responsive_search_ad: {
              headlines: campaignData.headlines.map(headline => ({
                text: headline,
                pin: 'UNPINNED'
              })),
              descriptions: campaignData.descriptions.map(desc => ({
                text: desc
              }))
            }
          }
        }

        await customer.adGroupAd.create(adOperation)
      }

      console.log('✅ Campagne créée avec succès:', { campaignId, adGroupId })
      
      return {
        campaignId: campaignId!,
        adGroupId: adGroupId!
      }
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error)
      throw error
    }
  }

  /**
   * Mappe les types de campagne vers les types Google Ads
   */
  private static mapCampaignType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'SEARCH': 'SEARCH',
      'SHOPPING': 'SHOPPING',
      'DISPLAY': 'DISPLAY',
      'VIDEO': 'VIDEO',
      'PMAX': 'PERFORMANCE_MAX'
    }
    return typeMap[type] || 'SEARCH'
  }

  /**
   * Optimise une campagne existante
   */
  static async optimizeCampaign(customerId: string, accessToken: string, campaignId: string, optimizations: {
    keywords?: { action: 'ADD' | 'REMOVE' | 'PAUSE'; keywords: string[] }
    bids?: { keywordId: string; newBid: number }[]
    budget?: number
    status?: 'ENABLED' | 'PAUSED'
  }): Promise<void> {
    if (!this.client) {
      throw new Error('Client Google Ads non initialisé')
    }

    try {
      const customer = this.client.Customer({
        customer_id: customerId,
        refresh_token: accessToken
      })

      console.log('🔧 Optimisation de campagne:', { campaignId, optimizations })

      // 1. Gestion des mots-clés
      if (optimizations.keywords) {
        for (const keywordAction of optimizations.keywords) {
          if (keywordAction.action === 'ADD') {
            // Ajouter de nouveaux mots-clés
            const keywordOperations = keywordAction.keywords.map(keyword => ({
              create: {
                ad_group: `customers/${customerId}/adGroups/${campaignId}`,
                text: keyword,
                match_type: 'BROAD'
              }
            }))
            await customer.adGroupCriterion.create(keywordOperations)
          } else if (keywordAction.action === 'REMOVE') {
            // Supprimer des mots-clés
            const keywordOperations = keywordAction.keywords.map(keyword => ({
              remove: {
                resource_name: `customers/${customerId}/adGroupCriteria/${keyword}`
              }
            }))
            await customer.adGroupCriterion.remove(keywordOperations)
          } else if (keywordAction.action === 'PAUSE') {
            // Pauser des mots-clés
            const keywordOperations = keywordAction.keywords.map(keyword => ({
              update: {
                resource_name: `customers/${customerId}/adGroupCriteria/${keyword}`,
                status: 'PAUSED'
              }
            }))
            await customer.adGroupCriterion.update(keywordOperations)
          }
        }
      }

      // 2. Ajustement des enchères
      if (optimizations.bids) {
        for (const bidAdjustment of optimizations.bids) {
          const bidOperation = {
            update: {
              resource_name: `customers/${customerId}/adGroupCriteria/${bidAdjustment.keywordId}`,
              cpc_bid_micros: bidAdjustment.newBid * 1000000
            }
          }
          await customer.adGroupCriterion.update(bidOperation)
        }
      }

      // 3. Modification du budget
      if (optimizations.budget) {
        // Récupérer d'abord le budget de la campagne
        const campaignQuery = `
          SELECT campaign.campaign_budget 
          FROM campaign 
          WHERE campaign.id = ${campaignId}
        `
        const campaignResponse = await customer.query(campaignQuery)
        const budgetResourceName = campaignResponse[0].campaign.campaignBudget

        const budgetOperation = {
          update: {
            resource_name: budgetResourceName,
            amount_micros: optimizations.budget * 1000000
          }
        }
        await customer.campaignBudget.update(budgetOperation)
      }

      // 4. Changement de statut
      if (optimizations.status) {
        const campaignOperation = {
          update: {
            resource_name: `customers/${customerId}/campaigns/${campaignId}`,
            status: optimizations.status
          }
        }
        await customer.campaign.update(campaignOperation)
      }

      console.log('✅ Optimisations appliquées avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error)
      throw error
    }
  }

  /**
   * Récupère les métriques détaillées d'une campagne
   */
  static async getCampaignMetrics(customerId: string, accessToken: string, campaignId: string, dateRange: {
    start: string
    end: string
  }): Promise<GoogleAdsMetrics> {
    if (!this.client) {
      throw new Error('Client Google Ads non initialisé')
    }

    try {
      const customer = this.client.Customer({
        customer_id: customerId,
        refresh_token: accessToken
      })

      const query = `
        SELECT 
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc_micros,
          metrics.conversions_from_interactions_rate,
          metrics.value_per_conversion
        FROM campaign 
        WHERE campaign.id = ${campaignId}
        AND segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}'
      `

      const response = await customer.query(query)
      
      if (response.length === 0) {
        throw new Error('Aucune donnée trouvée pour cette campagne')
      }

      const row = response[0]
      
      return {
        impressions: parseInt(row.metrics.impressions) || 0,
        clicks: parseInt(row.metrics.clicks) || 0,
        conversions: parseFloat(row.metrics.conversions) || 0,
        cost: row.metrics.costMicros / 1000000,
        ctr: parseFloat(row.metrics.ctr) || 0,
        cpc: row.metrics.averageCpcMicros / 1000000,
        conversionRate: parseFloat(row.metrics.conversionsFromInteractionsRate) || 0,
        roas: parseFloat(row.metrics.valuePerConversion) || 0
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error)
      throw error
    }
  }

  /**
   * Teste la connexion à un compte Google Ads
   */
  static async testConnection(customerId: string, accessToken: string): Promise<boolean> {
    if (!this.client) {
      return false
    }

    try {
      const customer = this.client.Customer({
        customer_id: customerId,
        refresh_token: accessToken
      })

      // Test simple avec une requête basique
      const query = 'SELECT customer.id FROM customer LIMIT 1'
      await customer.query(query)
      
      return true
    } catch (error) {
      console.error('Erreur de test de connexion:', error)
      return false
    }
  }

  /**
   * Récupère les informations d'un compte
   */
  static async getAccountInfo(customerId: string, accessToken: string): Promise<GoogleAdsAccount> {
    if (!this.client) {
      throw new Error('Client Google Ads non initialisé')
    }

    try {
      const customer = this.client.Customer({
        customer_id: customerId,
        refresh_token: accessToken
      })

      const query = `
        SELECT 
          customer.id,
          customer.descriptive_name,
          customer.status,
          customer.currency_code,
          customer.time_zone
        FROM customer
      `

      const response = await customer.query(query)
      
      if (response.length === 0) {
        throw new Error('Compte non trouvé')
      }

      const row = response[0]
      
      return {
        customerId: row.customer.id,
        name: row.customer.descriptiveName,
        status: row.customer.status,
        currency: row.customer.currencyCode,
        timeZone: row.customer.timeZone
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des infos du compte:', error)
      throw error
    }
  }

  /**
   * Synchronise les données d'un compte avec notre base de données
   */
  static async syncAccountData(customerId: string, accessToken: string): Promise<void> {
    try {
      // Récupérer les campagnes depuis Google Ads
      const campaigns = await this.getCampaigns(customerId, accessToken)
      
      // Mettre à jour notre base de données
      for (const campaign of campaigns) {
        await db.campaign.upsert({
          where: { googleAdsId: campaign.id },
          update: {
            name: campaign.name,
            status: campaign.status,
            type: campaign.type,
            budget: campaign.budget,
            startDate: new Date(campaign.startDate),
            endDate: campaign.endDate ? new Date(campaign.endDate) : null,
            metrics: JSON.stringify(campaign.metrics),
            updatedAt: new Date()
          },
          create: {
            googleAdsId: campaign.id,
            name: campaign.name,
            status: campaign.status,
            type: campaign.type,
            budget: campaign.budget,
            startDate: new Date(campaign.startDate),
            endDate: campaign.endDate ? new Date(campaign.endDate) : null,
            metrics: JSON.stringify(campaign.metrics),
            clientAccountId: customerId // TODO: Récupérer le bon clientAccountId
          }
        })
      }
      
      console.log(`✅ Synchronisation terminée pour ${campaigns.length} campagnes`)
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
      throw error
    }
  }
}

// Initialiser le service au démarrage
GoogleAdsAPIService.initialize() 