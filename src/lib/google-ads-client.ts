import { GoogleAdsApi, Customer } from 'google-ads-api'

export interface GoogleAdsConfig {
  client_id: string
  client_secret: string
  developer_token: string
  refresh_token: string
  customer_id: string
  loginCustomerId?: string
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
      login_customer_id: config.loginCustomerId,
    })
  }

  /**
   * Top 10 mots-clés (réseau de recherche)
   */
  async getTopKeywords(startDate?: Date, endDate?: Date) {
    try {
      let dateFilter = 'WHERE segments.date DURING LAST_7_DAYS'
      if (startDate && endDate) {
        const startStr = startDate.toISOString().split('T')[0]
        const endStr = endDate.toISOString().split('T')[0]
        dateFilter = `WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'`
      }

      const rows = await this.customer.query(`
        SELECT
          ad_group_criterion.keyword.text,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.ctr,
          metrics.conversions
        FROM keyword_view
        ${dateFilter}
        AND ad_group_criterion.status = 'ENABLED'
        AND campaign.advertising_channel_type = 'SEARCH'
        ORDER BY metrics.clicks DESC
        LIMIT 10
      `)

      return rows.map((r: any) => {
        const clicks = parseInt(r.metrics?.clicks ?? '0')
        const costMicros = Number(r.metrics?.cost_micros ?? r.metrics?.costMicros ?? 0)
        return {
          keyword: r.ad_group_criterion?.keyword?.text || '(not set)',
          impressions: parseInt(r.metrics?.impressions ?? '0'),
          clicks,
          ctr: parseFloat(r.metrics?.ctr ?? '0') * 100,
          cpc: (costMicros / Math.max(clicks, 1)) / 1_000_000,
          conversions: parseFloat(r.metrics?.conversions ?? '0')
        }
      })
    } catch (error) {
      console.error('❌ Erreur getTopKeywords:', error)
      throw error
    }
  }
  /**
   * Récupérer les métriques journalières agrégées au niveau du compte
   */
  async getDailyMetrics(startDate?: Date, endDate?: Date) {
    try {
      let dateFilter = 'WHERE segments.date DURING LAST_7_DAYS'
      if (startDate && endDate) {
        const startStr = startDate.toISOString().split('T')[0]
        const endStr = endDate.toISOString().split('T')[0]
        dateFilter = `WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'`
      }

      const rows = await this.customer.query(`
        SELECT
          segments.date,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM customer
        ${dateFilter}
        ORDER BY segments.date ASC
      `)

      return rows.map((r: any) => {
        const impressions = parseInt(r.metrics?.impressions ?? '0')
        const clicks = parseInt(r.metrics?.clicks ?? '0')
        const conversions = parseFloat(r.metrics?.conversions ?? '0')
        const costMicrosRaw = r.metrics?.cost_micros ?? r.metrics?.costMicros ?? 0
        const cost = Number(costMicrosRaw) / 1_000_000
        return {
          date: r.segments?.date,
          impressions,
          clicks,
          cost,
          conversions,
        }
      })
    } catch (error) {
      console.error('❌ Erreur getDailyMetrics:', error)
      throw error
    }
  }

  /**
   * Récupérer le détail des conversions par catégorie (achat, ajout au panier, formulaire, etc.)
   */
  async getConversionBreakdown(startDate?: Date, endDate?: Date) {
    try {
      let dateFilter = 'WHERE segments.date DURING LAST_7_DAYS'
      if (startDate && endDate) {
        const startStr = startDate.toISOString().split('T')[0]
        const endStr = endDate.toISOString().split('T')[0]
        dateFilter = `WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'`
      }

      // Utiliser la dimension de segment "conversion_action_category" depuis la vue customer
      const rows = await this.customer.query(`
        SELECT
          segments.conversion_action_category,
          metrics.conversions
        FROM customer
        ${dateFilter}
      `)

      const map: Record<string, number> = {}
      for (const r of rows) {
        const cat = (r.segments?.conversion_action_category as string) || 'UNSPECIFIED'
        const raw = r.metrics?.conversions
        const val = typeof raw === 'string' ? parseFloat(raw) : Number(raw || 0)
        map[cat] = (map[cat] || 0) + val
      }

      return Object.entries(map).map(([category, conversions]) => ({ category, conversions }))
    } catch (error) {
      console.error('❌ Erreur getConversionBreakdown:', error)
      throw error
    }
  }
  /**
   * Récupérer les campagnes avec métriques
   */
  async getCampaigns(startDate?: Date, endDate?: Date) {
    try {
      console.log('🔍 Récupération des campagnes via gRPC')
      
      let dateFilter = 'WHERE segments.date DURING LAST_30_DAYS'
      
      if (startDate && endDate) {
        const startStr = startDate.toISOString().split('T')[0]
        const endStr = endDate.toISOString().split('T')[0]
        dateFilter = `WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'`
        console.log('🔍 Filtre de date:', dateFilter)
      }
      
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
        ${dateFilter}
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