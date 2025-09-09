import { db } from './db'

export interface ShopifyStore {
  id: string
  name: string
  domain: string
  email: string
  currency: string
  country: string
  timezone: string
  accessToken: string
  isActive: boolean
  createdAt: Date
}

export interface ShopifyProduct {
  id: string
  title: string
  body_html?: string
  description?: string
  vendor: string
  product_type?: string
  productType?: string
  tags: string[]
  status: 'active' | 'archived' | 'draft'
  published_at?: string
  publishedAt?: string
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  currency?: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  collections?: string[]
  seo?: {
    title: string
    description: string
  }
  gtin?: string
  ai_analysis?: any
}

export interface ShopifyVariant {
  id: string
  title: string
  sku?: string
  price: string
  compare_at_price?: string
  compareAtPrice?: string
  inventory_quantity?: number
  inventoryQuantity?: number
  inventory_policy?: string
  inventoryPolicy?: string

  taxable?: boolean
  barcode?: string
}

export interface ShopifyImage {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export class ShopifyGraphQLService {
  private static baseUrl = 'https://api.shopify.com/admin/api/2024-07/graphql.json'

  /**
   * Initialise la connexion Shopify avec OAuth
   */
  static getAuthUrl(shop: string, scopes: string[] = ['read_products', 'read_inventory', 'read_orders']): string {
    const clientId = process.env.SHOPIFY_CLIENT_ID
    const redirectUri = process.env.SHOPIFY_REDIRECT_URI
    
    if (!clientId || !redirectUri) {
      throw new Error('Configuration Shopify manquante')
    }

    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    const scopeString = scopes.join(',')
    return `https://${fullShopDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopeString}&redirect_uri=${redirectUri}&state=${Date.now()}`
  }

  /**
   * Récupère les produits via GraphQL
   */
  static async getProducts(domain: string, accessToken: string, limit: number = 50, cursor?: string): Promise<ShopifyProduct[]> {
    const fullDomain = domain.includes('.myshopify.com') ? domain : `${domain}.myshopify.com`
    
    const query = `
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              bodyHtml
              vendor
              productType
              tags
              status
              publishedAt
              createdAt
              updatedAt
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    compareAtPrice
                    inventoryQuantity
                    inventoryPolicy

                    taxable
                    barcode
                  }
                }
              }
              images(first: 250) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              collections(first: 250) {
                edges {
                  node {
                    id
                    title
                    handle
                  }
                }
              }
              seo {
                title
                description
              }
            }
          }
        }
      }
    `

    try {
      const response = await fetch(`https://${fullDomain}/admin/api/2024-07/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query,
          variables: {
            first: limit,
            after: cursor
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
      }

      const products = data.data.products.edges.map((edge: any) => {
        const product = edge.node
        return {
          id: product.id.replace('gid://shopify/Product/', ''),
          title: product.title,
          body_html: product.bodyHtml,
          description: product.bodyHtml,
          vendor: product.vendor,
          product_type: product.productType,
          productType: product.productType,
          tags: product.tags || [],
          status: product.status,
          published_at: product.publishedAt,
          publishedAt: product.publishedAt,
          created_at: product.createdAt,
          createdAt: product.createdAt,
          updated_at: product.updatedAt,
          updatedAt: product.updatedAt,
          variants: product.variants.edges.map((v: any) => ({
            id: v.node.id.replace('gid://shopify/ProductVariant/', ''),
            title: v.node.title,
            sku: v.node.sku,
            price: v.node.price,
            compare_at_price: v.node.compareAtPrice,
            compareAtPrice: v.node.compareAtPrice,
            inventory_quantity: v.node.inventoryQuantity,
            inventoryQuantity: v.node.inventoryQuantity,
            inventory_policy: v.node.inventoryPolicy,
            inventoryPolicy: v.node.inventoryPolicy,
            weight: v.node.weight,
            weight_unit: v.node.weightUnit,
            weightUnit: v.node.weightUnit,
            requires_shipping: v.node.requiresShipping,
            requiresShipping: v.node.requiresShipping,
            taxable: v.node.taxable,
            barcode: v.node.barcode
          })),
          images: product.images.edges.map((img: any) => ({
            id: img.node.id.replace('gid://shopify/ProductImage/', ''),
            // Fournir les deux clés pour compat UI
            url: img.node.url,
            src: img.node.url,
            alt: img.node.altText || '',
            width: img.node.width,
            height: img.node.height
          })),
          // Normalisation pour l'UI et l'export GMC
          image_link: (product.images.edges[0]?.node?.url) || '',
          additional_image_links: product.images.edges.slice(1, 10).map((i: any) => i?.node?.url).filter(Boolean),
          collections: product.collections.edges.map((c: any) => c.node.handle),
          seo: product.seo
        }
      })

      return products

    } catch (error) {
      console.error('Erreur GraphQL Shopify:', error)
      throw error
    }
  }

  /**
   * Récupère les commandes via GraphQL
   */
  static async getOrders(domain: string, accessToken: string, days: number = 90): Promise<any[]> {
    const fullDomain = domain.includes('.myshopify.com') ? domain : `${domain}.myshopify.com`
    const createdAtMin = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    
    const query = `
      query GetOrders($query: String!) {
        orders(first: 250, query: $query) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 250) {
                edges {
                  node {
                    product {
                      id
                    }
                    quantity
                    variant {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    try {
      const response = await fetch(`https://${fullDomain}/admin/api/2024-07/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query,
          variables: {
            query: `created_at:>='${createdAtMin}' AND financial_status:paid`
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
      }

      return data.data.orders.edges.map((edge: any) => edge.node)

    } catch (error) {
      console.error('Erreur GraphQL Shopify orders:', error)
      throw error
    }
  }

  /**
   * Récupère les informations du shop via GraphQL
   */
  static async getShopInfo(domain: string, accessToken: string): Promise<any> {
    const fullDomain = domain.includes('.myshopify.com') ? domain : `${domain}.myshopify.com`
    
    const query = `
      query GetShop {
        shop {
          id
          name
          email
          currencyCode
          primaryDomain {
            url
            host
          }
          timezoneAbbreviation
          ianaTimezone
        }
      }
    `

    try {
      const response = await fetch(`https://${fullDomain}/admin/api/2024-07/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
      }

      return data.data.shop

    } catch (error) {
      console.error('Erreur GraphQL Shopify shop:', error)
      throw error
    }
  }

  /**
   * Optimise un produit pour GMC
   */
  static optimizeProductForGMC(product: ShopifyProduct): ShopifyProduct {
    // Logique d'optimisation existante
    const optimized = { ...product }
    
    // Calculer le vrai score (0-100)
    const baseQualityScore = this.computeBaseQualityScore(optimized) // 0-50
    const marginScore = this.computeMarginScore(optimized) // 0-25
    const recruitmentScore = this.computeRecruitmentHeuristicScore(optimized) // 0-25
    
    const totalScore = Math.round(baseQualityScore + marginScore + recruitmentScore)
    
    optimized.ai_analysis = {
      score: totalScore,
      subscores: {
        base_quality: baseQualityScore,
        margin: marginScore,
        recruitment: recruitmentScore
      },
      recommendations: this.generateRecommendations(totalScore, baseQualityScore, marginScore, recruitmentScore)
    }
    
    // Ajouter le score dans custom_label_2 pour l'affichage
    optimized.custom_label_2 = totalScore.toString()

    // Extraire le GTIN du barcode de la première variante
    if (product.variants && product.variants.length > 0) {
      optimized.gtin = product.variants[0].barcode || product.id
    }

    return optimized
  }

  /**
   * Calcule les stats de recrutement
   */
  static async computeRecruitmentStats(domain: string, accessToken: string, days: number = 90): Promise<any> {
    try {
      const orders = await this.getOrders(domain, accessToken, days)
      
      // Logique de calcul des stats de recrutement
      const stats = orders.map(order => ({
        orderId: order.id,
        productId: order.lineItems.edges[0]?.node?.product?.id?.replace('gid://shopify/Product/', ''),
        quantity: order.lineItems.edges[0]?.node?.quantity || 0,
        revenue: parseFloat(order.totalPriceSet.shopMoney.amount),
        weighted_norm: Math.random() * 2 // Simulation
      }))

      return { stats }
    } catch (error) {
      console.error('Erreur calcul stats recrutement:', error)
      return { stats: [] }
    }
  }

  /**
   * Récupère les stores d'un utilisateur
   */
  static async getUserStores(userId: string): Promise<ShopifyStore[]> {
    try {
      const stores = await db.shopifyStore.findMany({
        where: { userId }
      })
      return stores
    } catch (error) {
      console.error('Erreur récupération stores:', error)
      return []
    }
  }

  /**
   * Calcule le sous-score de qualité de fiche (0-50)
   */
  private static computeBaseQualityScore(product: ShopifyProduct): number {
    let score = 30 // Base neutre
    
    // Images (10 points)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) score += 10
    
    // Description (10 points)
    const description = product.description || product.bodyHtml || ''
    if (description && typeof description === 'string' && description.length > 100) score += 10
    
    return Math.max(0, Math.min(score, 50))
  }

  /**
   * Calcule un sous-score de marge (0-25)
   */
  private static computeMarginScore(product: ShopifyProduct): number {
    if (!product.variants || product.variants.length === 0) return 0
    
    const variant = product.variants[0]
    const price = parseFloat(variant.price || '0')
    const comparePrice = parseFloat(variant.compareAtPrice || '0')
    
    if (price <= 0) return 0
    
    // Calculer la marge estimée
    let estimatedMarginPercent = 0
    if (comparePrice > price) {
      estimatedMarginPercent = ((comparePrice - price) / comparePrice) * 100
    } else {
      // Heuristique basée sur le prix
      if (price < 10) estimatedMarginPercent = 20
      else if (price < 50) estimatedMarginPercent = 30
      else if (price < 100) estimatedMarginPercent = 40
      else estimatedMarginPercent = 50
    }
    
    let score = 0
    if (estimatedMarginPercent <= 10) score = 0
    else if (estimatedMarginPercent <= 30) score = 12 * ((estimatedMarginPercent - 10) / 20)
    else if (estimatedMarginPercent <= 60) score = 12 + 10 * ((estimatedMarginPercent - 30) / 30)
    else score = 25
    
    return Math.max(0, Math.min(score, 25))
  }

  /**
   * Heuristique initiale pour le sous-score recrutement (0-25)
   */
  private static computeRecruitmentHeuristicScore(product: ShopifyProduct): number {
    if (!product.variants || product.variants.length === 0) return 0
    
    const variant = product.variants[0]
    const price = parseFloat(variant.price || '0')
    const stock = variant.inventoryQuantity || 0
    
    // Score basé sur le prix d'entrée (0-8 points)
    let priceEntryScore = 0
    if (price < 5) priceEntryScore = 8
    else if (price < 15) priceEntryScore = 6
    else if (price < 30) priceEntryScore = 4
    else if (price < 50) priceEntryScore = 2
    else priceEntryScore = 0
    
    // Score basé sur le stock (0-4 points)
    const stockScore = Math.max(0, Math.min(4, Math.floor(Math.min(stock / 20, 1) * 4)))
    
    // Score basé sur les promotions (0-4 points)
    const comparePrice = parseFloat(variant.compareAtPrice || '0')
    const discount = comparePrice > price ? (comparePrice - price) / comparePrice : 0
    const promoScore = discount >= 0.2 ? 4 : discount >= 0.1 ? 2 : 0
    
    // Score basé sur les variantes (0-3 points)
    const variantsCount = product.variants?.length || 0
    const variantsScore = variantsCount >= 3 ? 3 : variantsCount === 2 ? 1 : 0
    
    return Math.max(0, Math.min(25, priceEntryScore + stockScore + promoScore + variantsScore))
  }

  /**
   * Génère des recommandations basées sur les scores
   */
  private static generateRecommendations(totalScore: number, baseQuality: number, margin: number, recruitment: number): string[] {
    const recommendations: string[] = []
    
    if (baseQuality < 30) recommendations.push('Améliorer la qualité de la fiche produit')
    if (margin < 10) recommendations.push('Optimiser la marge du produit')
    if (recruitment < 10) recommendations.push('Améliorer l\'attractivité du produit')
    if (totalScore < 50) recommendations.push('Optimisation générale recommandée')
    
    return recommendations.length > 0 ? recommendations : ['Produit bien optimisé']
  }
} 