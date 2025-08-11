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
  budget: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
}

export interface AccountMetrics {
  totalImpressions: number
  totalClicks: number
  totalCost: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  totalCampaigns: number
  activeCampaigns: number
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

  static async getCampaigns(customerId: string, refreshToken: string) {
    try {
      const customer = this.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `

      const response = await customer.query(query)
      
      return response.map((row: any) => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        impressions: parseInt(row.metrics.impressions) || 0,
        clicks: parseInt(row.metrics.clicks) || 0,
        cost: parseFloat(row.metrics.costMicros) / 1000000 || 0,
        conversions: parseFloat(row.metrics.conversions) || 0,
        ctr: parseFloat(row.metrics.ctr) || 0,
        cpc: parseFloat(row.metrics.averageCpc) / 1000000 || 0,
        cpm: parseFloat(row.metrics.averageCpm) / 1000000 || 0,
      }))
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
      
      const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ENABLED').length
      
      return {
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions,
        averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCpc: totalClicks > 0 ? totalCost / totalClicks : 0,
        averageCpm: totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0,
        totalCampaigns: campaigns.length,
        activeCampaigns,
      }
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error)
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
} 
 

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
  budget: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
}

export interface AccountMetrics {
  totalImpressions: number
  totalClicks: number
  totalCost: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  totalCampaigns: number
  activeCampaigns: number
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

  static async getCampaigns(customerId: string, refreshToken: string) {
    try {
      const customer = this.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `

      const response = await customer.query(query)
      
      return response.map((row: any) => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        impressions: parseInt(row.metrics.impressions) || 0,
        clicks: parseInt(row.metrics.clicks) || 0,
        cost: parseFloat(row.metrics.costMicros) / 1000000 || 0,
        conversions: parseFloat(row.metrics.conversions) || 0,
        ctr: parseFloat(row.metrics.ctr) || 0,
        cpc: parseFloat(row.metrics.averageCpc) / 1000000 || 0,
        cpm: parseFloat(row.metrics.averageCpm) / 1000000 || 0,
      }))
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
      
      const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ENABLED').length
      
      return {
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions,
        averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCpc: totalClicks > 0 ? totalCost / totalClicks : 0,
        averageCpm: totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0,
        totalCampaigns: campaigns.length,
        activeCampaigns,
      }
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error)
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
} 

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
  budget: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
}

export interface AccountMetrics {
  totalImpressions: number
  totalClicks: number
  totalCost: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  totalCampaigns: number
  activeCampaigns: number
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

  static async getCampaigns(customerId: string, refreshToken: string) {
    try {
      const customer = this.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `

      const response = await customer.query(query)
      
      return response.map((row: any) => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        impressions: parseInt(row.metrics.impressions) || 0,
        clicks: parseInt(row.metrics.clicks) || 0,
        cost: parseFloat(row.metrics.costMicros) / 1000000 || 0,
        conversions: parseFloat(row.metrics.conversions) || 0,
        ctr: parseFloat(row.metrics.ctr) || 0,
        cpc: parseFloat(row.metrics.averageCpc) / 1000000 || 0,
        cpm: parseFloat(row.metrics.averageCpm) / 1000000 || 0,
      }))
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
      
      const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ENABLED').length
      
      return {
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions,
        averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCpc: totalClicks > 0 ? totalCost / totalClicks : 0,
        averageCpm: totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0,
        totalCampaigns: campaigns.length,
        activeCampaigns,
      }
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error)
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
} 
 

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
  budget: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
}

export interface AccountMetrics {
  totalImpressions: number
  totalClicks: number
  totalCost: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  totalCampaigns: number
  activeCampaigns: number
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

  static async getCampaigns(customerId: string, refreshToken: string) {
    try {
      const customer = this.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `

      const response = await customer.query(query)
      
      return response.map((row: any) => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        impressions: parseInt(row.metrics.impressions) || 0,
        clicks: parseInt(row.metrics.clicks) || 0,
        cost: parseFloat(row.metrics.costMicros) / 1000000 || 0,
        conversions: parseFloat(row.metrics.conversions) || 0,
        ctr: parseFloat(row.metrics.ctr) || 0,
        cpc: parseFloat(row.metrics.averageCpc) / 1000000 || 0,
        cpm: parseFloat(row.metrics.averageCpm) / 1000000 || 0,
      }))
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
      
      const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ENABLED').length
      
      return {
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions,
        averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCpc: totalClicks > 0 ? totalCost / totalClicks : 0,
        averageCpm: totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0,
        totalCampaigns: campaigns.length,
        activeCampaigns,
      }
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error)
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
} 

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
  budget: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
}

export interface AccountMetrics {
  totalImpressions: number
  totalClicks: number
  totalCost: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  totalCampaigns: number
  activeCampaigns: number
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

  static async getCampaigns(customerId: string, refreshToken: string) {
    try {
      const customer = this.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `

      const response = await customer.query(query)
      
      return response.map((row: any) => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        impressions: parseInt(row.metrics.impressions) || 0,
        clicks: parseInt(row.metrics.clicks) || 0,
        cost: parseFloat(row.metrics.costMicros) / 1000000 || 0,
        conversions: parseFloat(row.metrics.conversions) || 0,
        ctr: parseFloat(row.metrics.ctr) || 0,
        cpc: parseFloat(row.metrics.averageCpc) / 1000000 || 0,
        cpm: parseFloat(row.metrics.averageCpm) / 1000000 || 0,
      }))
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
      
      const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ENABLED').length
      
      return {
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions,
        averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCpc: totalClicks > 0 ? totalCost / totalClicks : 0,
        averageCpm: totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0,
        totalCampaigns: campaigns.length,
        activeCampaigns,
      }
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error)
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
} 
 

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
  budget: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
}

export interface AccountMetrics {
  totalImpressions: number
  totalClicks: number
  totalCost: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  totalCampaigns: number
  activeCampaigns: number
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

  static async getCampaigns(customerId: string, refreshToken: string) {
    try {
      const customer = this.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `

      const response = await customer.query(query)
      
      return response.map((row: any) => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        impressions: parseInt(row.metrics.impressions) || 0,
        clicks: parseInt(row.metrics.clicks) || 0,
        cost: parseFloat(row.metrics.costMicros) / 1000000 || 0,
        conversions: parseFloat(row.metrics.conversions) || 0,
        ctr: parseFloat(row.metrics.ctr) || 0,
        cpc: parseFloat(row.metrics.averageCpc) / 1000000 || 0,
        cpm: parseFloat(row.metrics.averageCpm) / 1000000 || 0,
      }))
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
      
      const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ENABLED').length
      
      return {
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions,
        averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCpc: totalClicks > 0 ? totalCost / totalClicks : 0,
        averageCpm: totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0,
        totalCampaigns: campaigns.length,
        activeCampaigns,
      }
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error)
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
} 

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
  budget: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
}

export interface AccountMetrics {
  totalImpressions: number
  totalClicks: number
  totalCost: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpm: number
  totalCampaigns: number
  activeCampaigns: number
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

  static async getCampaigns(customerId: string, refreshToken: string) {
    try {
      const customer = this.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.average_cpm
        FROM campaign
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
      `

      const response = await customer.query(query)
      
      return response.map((row: any) => ({
        id: row.campaign.id,
        name: row.campaign.name,
        status: row.campaign.status,
        impressions: parseInt(row.metrics.impressions) || 0,
        clicks: parseInt(row.metrics.clicks) || 0,
        cost: parseFloat(row.metrics.costMicros) / 1000000 || 0,
        conversions: parseFloat(row.metrics.conversions) || 0,
        ctr: parseFloat(row.metrics.ctr) || 0,
        cpc: parseFloat(row.metrics.averageCpc) / 1000000 || 0,
        cpm: parseFloat(row.metrics.averageCpm) / 1000000 || 0,
      }))
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
      
      const activeCampaigns = campaigns.filter(campaign => campaign.status === 'ENABLED').length
      
      return {
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions,
        averageCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCpc: totalClicks > 0 ? totalCost / totalClicks : 0,
        averageCpm: totalImpressions > 0 ? (totalCost / totalImpressions) * 1000 : 0,
        totalCampaigns: campaigns.length,
        activeCampaigns,
      }
    } catch (error) {
      console.error('Erreur lors du calcul des métriques:', error)
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
} 