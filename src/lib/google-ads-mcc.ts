import { GoogleAdsApi } from "google-ads-api"
import { prisma } from "@/lib/db"

export interface GoogleAdsMCCConfig {
  clientId: string
  clientSecret: string
  developerToken: string
  refreshToken: string
}

export interface ClientGoogleAdsData {
  customerId: string
  customerName: string
  campaigns: any[]
  metrics: {
    impressions: number
    clicks: number
    cost: number
    conversions: number
    ctr: number
    averageCpc: number
  }
}

export class GoogleAdsMCCService {
  private client: GoogleAdsApi
  private config: GoogleAdsMCCConfig

  constructor(config: GoogleAdsMCCConfig) {
    this.config = config
    this.client = new GoogleAdsApi({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken,
    })
  }

  /**
   * Récupère tous les comptes Google Ads accessibles via le MCC
   */
  async getAllMCCAccounts(): Promise<any[]> {
    try {
      // Utiliser le premier compte comme point d&apos;entrée MCC
      const mccCustomer = this.client.Customer({
        customer_id: this.config.clientId,
        refresh_token: this.config.refreshToken,
      })

      // Récupérer tous les comptes liés au MCC
      const query = `
        SELECT 
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.status
        FROM customer
        WHERE customer.status = 'ENABLED'
      `

      const response = await mccCustomer.query(query)
      return response.map((row: any) => ({
        customerId: row.customer.id,
        customerName: row.customer.descriptive_name,
        currency: row.customer.currency_code,
        timeZone: row.customer.time_zone,
        status: row.customer.status
      }))
    } catch (error) {
      console.error("Erreur lors de la récupération des comptes MCC:", error)
      throw error
    }
  }

  /**
   * Récupère les comptes Google Ads autorisés pour un client spécifique
   */
  async getClientAuthorizedAccounts(clientAccountId: string): Promise<any[]> {
    try {
      // Récupérer les permissions du client
      const permissions = await prisma.googleAdsPermission.findMany({
        where: {
          clientAccountId,
          isActive: true
        }
      })

      if (permissions.length === 0) {
        return []
      }

      // Récupérer tous les comptes MCC
      const allAccounts = await this.getAllMCCAccounts()
      
      // Filtrer selon les permissions du client
      const authorizedCustomerIds = permissions.map(p => p.googleAdsCustomerId)
      return allAccounts.filter(account => 
        authorizedCustomerIds.includes(account.customerId)
      )
    } catch (error) {
      console.error("Erreur lors de la récupération des comptes autorisés:", error)
      throw error
    }
  }

  /**
   * Récupère les données Google Ads pour un client spécifique
   */
  async getClientGoogleAdsData(clientAccountId: string): Promise<ClientGoogleAdsData[]> {
    try {
      const authorizedAccounts = await this.getClientAuthorizedAccounts(clientAccountId)
      const clientData: ClientGoogleAdsData[] = []

      for (const account of authorizedAccounts) {
        const customer = this.client.Customer({
          customer_id: account.customerId,
          refresh_token: this.config.refreshToken,
        })

        // Récupérer les campagnes
        const campaignQuery = `
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
            metrics.cost_micros,
            metrics.conversions,
            metrics.average_cpc,
            metrics.ctr,
            metrics.average_cpm,
            metrics.conversions_from_interactions_rate
          FROM campaign 
          WHERE campaign.status IN ('ENABLED', 'PAUSED')
          ORDER BY metrics.impressions DESC
        `

        const campaigns = await customer.query(campaignQuery)
        
        // Calculer les métriques globales
        const globalMetrics = campaigns.reduce((acc: any, campaign: any) => {
          const metrics = campaign.metrics
          return {
            impressions: acc.impressions + parseInt(metrics.impressions || 0),
            clicks: acc.clicks + parseInt(metrics.clicks || 0),
            cost: acc.cost + parseFloat(metrics.cost_micros || 0) / 1000000,
            conversions: acc.conversions + parseFloat(metrics.conversions || 0),
          }
        }, {
          impressions: 0,
          clicks: 0,
          cost: 0,
          conversions: 0
        })

        // Calculer les métriques dérivées
        const ctr = globalMetrics.impressions > 0 ? (globalMetrics.clicks / globalMetrics.impressions) * 100 : 0
        const averageCpc = globalMetrics.clicks > 0 ? globalMetrics.cost / globalMetrics.clicks : 0

        clientData.push({
          customerId: account.customerId,
          customerName: account.customerName,
          campaigns: campaigns.map((campaign: any) => ({
            id: campaign.campaign.id,
            name: campaign.campaign.name,
            status: campaign.campaign.status,
            budget: parseFloat(campaign.campaign.budget_amount_micros || 0) / 1000000,
            metrics: {
              impressions: parseInt(campaign.metrics.impressions || 0),
              clicks: parseInt(campaign.metrics.clicks || 0),
              cost: parseFloat(campaign.metrics.cost_micros || 0) / 1000000,
              conversions: parseFloat(campaign.metrics.conversions || 0),
              ctr: parseFloat(campaign.metrics.ctr || 0),
              averageCpc: parseFloat(campaign.metrics.average_cpc || 0) / 1000000,
            }
          })),
          metrics: {
            impressions: globalMetrics.impressions,
            clicks: globalMetrics.clicks,
            cost: globalMetrics.cost,
            conversions: globalMetrics.conversions,
            ctr,
            averageCpc
          }
        })
      }

      return clientData
    } catch (error) {
      console.error("Erreur lors de la récupération des données client:", error)
      throw error
    }
  }

  /**
   * Ajoute une permission pour un client sur un compte Google Ads
   */
  async addClientPermission(
    clientAccountId: string, 
    userId: string, 
    googleAdsCustomerId: string, 
    permissions: { read: boolean; write: boolean; admin: boolean }
  ): Promise<void> {
    try {
      await prisma.googleAdsPermission.upsert({
        where: {
          clientAccountId_googleAdsCustomerId: {
            clientAccountId,
            googleAdsCustomerId
          }
        },
        update: {
          permissions: JSON.stringify(permissions),
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          clientAccountId,
          userId,
          googleAdsCustomerId,
          permissions: JSON.stringify(permissions),
          isActive: true
        }
      })
    } catch (error) {
      console.error("Erreur lors de l&apos;ajout de permission:", error)
      throw error
    }
  }

  /**
   * Supprime une permission pour un client
   */
  async removeClientPermission(clientAccountId: string, googleAdsCustomerId: string): Promise<void> {
    try {
      await prisma.googleAdsPermission.updateMany({
        where: {
          clientAccountId,
          googleAdsCustomerId
        },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error("Erreur lors de la suppression de permission:", error)
      throw error
    }
  }
} 