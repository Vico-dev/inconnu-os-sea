import { GoogleAdsApi, Customer } from 'google-ads-api'

export interface GoogleAdsConfig {
  client_id: string
  client_secret: string
  developer_token: string
  refresh_token: string
  customer_id: string
}

export class GoogleAdsService {
  private client: GoogleAdsApi
  private customer: Customer

  constructor(config: GoogleAdsConfig) {
    // Initialiser le client Google Ads API
    this.client = new GoogleAdsApi({
      client_id: config.client_id,
      client_secret: config.client_secret,
      developer_token: config.developer_token,
    })

    // Obtenir le customer
    this.customer = this.client.Customer({
      customer_id: config.customer_id,
      refresh_token: config.refresh_token,
    })
  }

  /**
   * Récupérer les campagnes avec métriques
   */
  async getCampaigns() {
    try {
      console.log('🔍 Récupération des campagnes via gRPC')
      
      const campaigns = await this.customer.query(`
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.average_cpc,
          metrics.ctr,
          metrics.average_cpm
        FROM campaign 
        WHERE segments.date DURING LAST_30_DAYS
      `)

      console.log('✅ Campagnes récupérées:', campaigns.length)
      return campaigns

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des campagnes:', error)
      throw error
    }
  }

  /**
   * Récupérer les métriques agrégées du compte
   */
  async getAccountMetrics() {
    try {
      console.log('🔍 Récupération des métriques du compte via gRPC')
      
      const metrics = await this.customer.query(`
        SELECT 
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.average_cpc,
          metrics.ctr,
          metrics.average_cpm
        FROM customer 
        WHERE segments.date DURING LAST_30_DAYS
      `)

      console.log('✅ Métriques du compte récupérées')
      return metrics[0] || null

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des métriques:', error)
      throw error
    }
  }

  /**
   * Tester la connexion
   */
  async testConnection() {
    try {
      console.log('🔍 Test de connexion gRPC')
      
      const customer = await this.customer.query(`
        SELECT 
          customer.id,
          customer.descriptive_name,
          customer.manager
        FROM customer 
        LIMIT 1
      `)

      console.log('✅ Connexion gRPC réussie')
      return customer[0]

    } catch (error) {
      console.error('❌ Erreur de connexion gRPC:', error)
      throw error
    }
  }
}

/**
 * Factory pour créer une instance du service Google Ads
 */
export function createGoogleAdsService(config: GoogleAdsConfig): GoogleAdsService {
  return new GoogleAdsService(config)
}