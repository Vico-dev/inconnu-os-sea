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
  body_html?: string // Description HTML de Shopify
  description?: string // Alias pour body_html
  vendor: string
  product_type?: string // Format Shopify
  productType?: string // Alias pour product_type
  tags: string
  status: 'active' | 'archived' | 'draft'
  published_at?: string // Format Shopify
  publishedAt?: string // Alias
  created_at?: string // Format Shopify
  createdAt?: string // Alias
  updated_at?: string // Format Shopify
  updatedAt?: string // Alias
  currency?: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  collections?: string[]
  seo?: {
    title: string
    description: string
  }
}

export interface ShopifyVariant {
  id: string
  title: string
  sku?: string
  price: string
  compare_at_price?: string // Format Shopify
  compareAtPrice?: string // Alias
  inventory_quantity?: number // Format Shopify
  inventoryQuantity?: number // Alias
  inventory_policy?: string // Format Shopify
  inventoryPolicy?: string // Alias
  weight?: number
  weight_unit?: string // Format Shopify
  weightUnit?: string // Alias
  requires_shipping?: boolean // Format Shopify
  requiresShipping?: boolean // Alias
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

export interface ShopifyCollection {
  id: string
  title: string
  description: string
  handle: string
  publishedAt: string
  productsCount: number
}

export class ShopifyGraphQLService {

  /**
   * Initialise la connexion Shopify avec OAuth
   */
  static getAuthUrl(shop: string, scopes: string[] = ['read_products', 'read_inventory', 'read_orders']): string {
    const clientId = process.env.SHOPIFY_CLIENT_ID
    const redirectUri = process.env.SHOPIFY_REDIRECT_URI
    
    if (!clientId || !redirectUri) {
      throw new Error('Configuration Shopify manquante')
    }

    // Ajouter .myshopify.com si pas déjà présent
    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    const scopeString = scopes.join(',')
    return `https://${fullShopDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopeString}&redirect_uri=${redirectUri}&state=${Date.now()}`
  }

  /**
   * Récupère les commandes payées avec pagination, filtrées par date via GraphQL
   */
  static async getPaidOrders(shop: string, accessToken: string, createdAtMin?: string): Promise<any[]> {
    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    
    const query = `
      query GetPaidOrders($first: Int!, $createdAt: String) {
        orders(first: $first, query: $createdAt) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              name
              createdAt
              totalPrice
              financialStatus
              fulfillmentStatus
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      product {
                        id
                        title
                      }
                    }
                  }
                }
              }
              customer {
                id
                email
                firstName
                lastName
              }
            }
          }
        }
      }
    `

    const variables: any = { first: 250 }
    if (createdAtMin) {
      variables.createdAt = `created_at:>=${createdAtMin} AND financial_status:paid`
    } else {
      variables.createdAt = 'financial_status:paid'
    }

    const response = await fetch(`https://${fullShopDomain}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      throw new Error(`Erreur API Shopify GraphQL: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      console.error('Erreurs GraphQL Shopify:', data.errors)
      throw new Error(`Erreur GraphQL: ${JSON.stringify(data.errors)}`)
    }

    // Convertir le format GraphQL vers le format REST pour compatibilité
    return data.data.orders.edges.map((edge: any) => ({
      id: edge.node.id.replace('gid://shopify/Order/', ''),
      name: edge.node.name,
      created_at: edge.node.createdAt,
      total_price: edge.node.totalPrice,
      financial_status: edge.node.financialStatus?.toLowerCase(),
      fulfillment_status: edge.node.fulfillmentStatus?.toLowerCase(),
      line_items: edge.node.lineItems.edges.map((itemEdge: any) => ({
        id: itemEdge.node.id.replace('gid://shopify/LineItem/', ''),
        title: itemEdge.node.title,
        quantity: itemEdge.node.quantity,
        variant_id: itemEdge.node.variant?.id?.replace('gid://shopify/ProductVariant/', ''),
        product_id: itemEdge.node.variant?.product?.id?.replace('gid://shopify/Product/', '')
      })),
      customer: edge.node.customer ? {
        id: edge.node.customer.id.replace('gid://shopify/Customer/', ''),
        email: edge.node.customer.email,
        first_name: edge.node.customer.firstName,
        last_name: edge.node.customer.lastName
      } : null
    }))
  }

  /**
   * Calcule les stats de recrutement par produit à partir des commandes payées
   * - Recrutement = première commande d'un client contenant le produit
   */
  static async computeRecruitmentStats(shop: string, accessToken: string, windowDays: number = 90) {
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString()
    const orders = await this.getPaidOrders(shop, accessToken, since)

    // Map clientId -> first order created_at
    const customerFirstOrderAt = new Map<string, { orderId: number; createdAt: string }>()
    for (const o of orders) {
      if (!o.customer) continue
      const cid = String(o.customer.id)
      const created = o.created_at
      const prev = customerFirstOrderAt.get(cid)
      if (!prev || new Date(created) < new Date(prev.createdAt)) {
        customerFirstOrderAt.set(cid, { orderId: o.id, createdAt: created })
      }
    }

    // Compter par produit les first orders
    const productRecruits = new Map<string, number>()
    const productFirstOrderCount = new Map<string, number>()
    const productOrderCount = new Map<string, number>()

    for (const o of orders) {
      const cid = o.customer ? String(o.customer.id) : null
      const isFirst = cid ? customerFirstOrderAt.get(cid)?.orderId === o.id : false
      const items: any[] = o.line_items || []
      const uniqueProductIds = Array.from(new Set(items.map(i => String(i.product_id))))

      // Total commandes contenant le produit
      for (const pid of uniqueProductIds) {
        productOrderCount.set(pid, (productOrderCount.get(pid) || 0) + 1)
      }

      if (isFirst) {
        const weight = 1 / Math.max(1, uniqueProductIds.length) // attribution fractionnelle simple
        for (const pid of uniqueProductIds) {
          productRecruits.set(pid, (productRecruits.get(pid) || 0) + weight)
          productFirstOrderCount.set(pid, (productFirstOrderCount.get(pid) || 0) + 1)
        }
      }
    }

    // Normalisation simple vs médiane
    const recruitsValues = Array.from(productRecruits.values())
    const median = recruitsValues.length ? recruitsValues.sort((a,b)=>a-b)[Math.floor(recruitsValues.length/2)] : 0

    const stats = Array.from(productOrderCount.keys()).map(pid => {
      const recruits = productRecruits.get(pid) || 0
      const ordersWithProduct = productOrderCount.get(pid) || 0
      const firstOrders = productFirstOrderCount.get(pid) || 0
      const firstOrderRate = ordersWithProduct ? firstOrders / ordersWithProduct : 0
      const weightedNorm = median ? Math.min(2, recruits / median) : (recruits > 0 ? 1 : 0) // 0..2
      return {
        productId: pid,
        recruits: Number(recruits.toFixed(2)),
        first_orders: firstOrders,
        orders_with_product: ordersWithProduct,
        first_order_rate: Number(firstOrderRate.toFixed(3)),
        weighted_norm: Number(weightedNorm.toFixed(3)),
        window_days: windowDays,
      }
    })

    return { stats, median: Number(median.toFixed(2)), total_orders: orders.length }
  }

  /**
   * Échange le code d'autorisation contre un token d'accès
   */
  static async exchangeCodeForToken(shop: string, code: string): Promise<{ accessToken: string; scope: string }> {
    const clientId = process.env.SHOPIFY_CLIENT_ID
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET
    
    if (!clientId || !clientSecret) {
      throw new Error('Configuration Shopify manquante')
    }

    // Ajouter .myshopify.com si pas déjà présent
    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    const response = await fetch(`https://${fullShopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    })

    if (!response.ok) {
      throw new Error('Erreur lors de l\'échange du token Shopify')
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      scope: data.scope,
    }
  }

  /**
   * Récupère les informations du store via GraphQL
   */
  static async getShopInfo(shop: string, accessToken: string): Promise<Partial<ShopifyStore>> {
    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    
    const query = `
      query GetShopInfo {
        shop {
          name
          myshopifyDomain
          email
          currencyCode
          countryName
          timezoneAbbreviation
          plan {
            displayName
          }
        }
      }
    `

    const response = await fetch(`https://${fullShopDomain}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      throw new Error(`Erreur API Shopify GraphQL: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      console.error('Erreurs GraphQL Shopify:', data.errors)
      throw new Error(`Erreur GraphQL: ${JSON.stringify(data.errors)}`)
    }

    return {
      name: data.data.shop.name,
      domain: data.data.shop.myshopifyDomain,
      email: data.data.shop.email,
      currency: data.data.shop.currencyCode,
      country: data.data.shop.countryName,
      timezone: data.data.shop.timezoneAbbreviation,
    }
  }

  /**
   * Récupère tous les produits du store via GraphQL (migration depuis REST déprécié)
   */
  static async getProducts(shop: string, accessToken: string, limit: number = 250): Promise<ShopifyProduct[]> {
    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    
    const query = `
      query GetProducts($first: Int!) {
        products(first: $first) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              description
              handle
              vendor
              productType
              tags
              status
              createdAt
              updatedAt
              variants(first: 10) {
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
              images(first: 10) {
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
            }
          }
        }
      }
    `

    const response = await fetch(`https://${fullShopDomain}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { first: Math.min(limit, 250) }
      })
    })

    if (!response.ok) {
      throw new Error(`Erreur API Shopify GraphQL: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      console.error('Erreurs GraphQL Shopify:', data.errors)
      throw new Error(`Erreur GraphQL: ${JSON.stringify(data.errors)}`)
    }

    const products = data.data.products.edges.map((edge: any) => this.convertGraphQLToShopifyProduct(edge.node))
    
    // Debug: afficher la structure du premier produit
    if (products.length > 0) {
      console.log('🔍 Debug - Premier produit Shopify GraphQL:', JSON.stringify(products[0], null, 2))
    }
    
    return products
  }

  /**
   * Convertit un produit GraphQL vers le format Shopify standard
   */
  private static convertGraphQLToShopifyProduct(graphqlProduct: any): ShopifyProduct {
    return {
      id: graphqlProduct.id.replace('gid://shopify/Product/', ''),
      title: graphqlProduct.title || 'Sans titre',
      body_html: graphqlProduct.description || '',
      description: graphqlProduct.description || '',
      vendor: graphqlProduct.vendor || 'Marque inconnue',
      product_type: graphqlProduct.productType || '',
      productType: graphqlProduct.productType || '',
      tags: graphqlProduct.tags || [],
      status: graphqlProduct.status?.toLowerCase() || 'draft',
      published_at: graphqlProduct.createdAt || '',
      publishedAt: graphqlProduct.createdAt || '',
      created_at: graphqlProduct.createdAt || '',
      createdAt: graphqlProduct.createdAt || '',
      updated_at: graphqlProduct.updatedAt || '',
      updatedAt: graphqlProduct.updatedAt || '',
      handle: graphqlProduct.handle || '',
      variants: graphqlProduct.variants?.edges?.map((edge: any) => ({
        id: edge.node.id.replace('gid://shopify/ProductVariant/', ''),
        title: edge.node.title || 'Default Title',
        sku: edge.node.sku || '',
        price: edge.node.price || '0.00',
        compare_at_price: edge.node.compareAtPrice || '',
        compareAtPrice: edge.node.compareAtPrice || '',
        inventory_quantity: edge.node.inventoryQuantity || 0,
        inventoryQuantity: edge.node.inventoryQuantity || 0,
        inventory_policy: edge.node.inventoryPolicy || 'deny',
        inventoryPolicy: edge.node.inventoryPolicy || 'deny',
        taxable: edge.node.taxable || false,
        barcode: edge.node.barcode || ''
      })) || [],
      images: graphqlProduct.images?.edges?.map((edge: any) => ({
        id: edge.node.id.replace('gid://shopify/MediaImage/', ''),
        src: edge.node.url || '',
        alt: edge.node.altText || '',
        width: edge.node.width || 0,
        height: edge.node.height || 0
      })) || []
    }
  }

  /**
   * Récupère les collections du store
   */
  static async getCollections(shop: string, accessToken: string): Promise<ShopifyCollection[]> {
    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    
    const query = `
      query GetCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              updatedAt
            }
          }
        }
      }
    `

    const response = await fetch(`https://${fullShopDomain}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { first: 250 }
      })
    })

    if (!response.ok) {
      throw new Error(`Erreur API Shopify GraphQL: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      console.error('Erreurs GraphQL Shopify:', data.errors)
      throw new Error(`Erreur GraphQL: ${JSON.stringify(data.errors)}`)
    }

    return data.data.collections.edges.map((edge: any) => ({
      id: edge.node.id.replace('gid://shopify/Collection/', ''),
      title: edge.node.title || 'Sans titre',
      handle: edge.node.handle || '',
      description: edge.node.description || '',
      updated_at: edge.node.updatedAt || ''
    }))
  }

  /**
   * Récupère les produits d'une collection spécifique
   */
  static async getCollectionProducts(shop: string, accessToken: string, collectionId: string): Promise<ShopifyProduct[]> {
    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    
    const query = `
      query GetCollectionProducts($id: ID!, $first: Int!) {
        collection(id: $id) {
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                handle
                vendor
                productType
                tags
                status
                createdAt
                updatedAt
                variants(first: 10) {
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
                images(first: 10) {
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
              }
            }
          }
        }
      }
    `

    const response = await fetch(`https://${fullShopDomain}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { 
          id: `gid://shopify/Collection/${collectionId}`,
          first: 250 
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Erreur API Shopify GraphQL: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      console.error('Erreurs GraphQL Shopify:', data.errors)
      throw new Error(`Erreur GraphQL: ${JSON.stringify(data.errors)}`)
    }

    const products = data.data.collection?.products?.edges?.map((edge: any) => 
      this.convertGraphQLToShopifyProduct(edge.node)
    ) || []
    
    return products
  }

  /**
   * Sauvegarde un store Shopify en base de données
   */
  static async saveStore(userId: string, shopData: Partial<ShopifyStore>): Promise<ShopifyStore> {
    const store = await db.shopifyStore.create({
      data: {
        userId,
        name: shopData.name!,
        domain: shopData.domain!,
        email: shopData.email!,
        currency: shopData.currency!,
        country: shopData.country!,
        timezone: shopData.timezone!,
        accessToken: shopData.accessToken!,
        isActive: true,
      },
    })

    return store
  }

  /**
   * Récupère les stores d'un utilisateur
   */
  static async getUserStores(userId: string): Promise<ShopifyStore[]> {
    return await db.shopifyStore.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Supprime un store Shopify
   */
  static async removeStore(storeId: string, userId: string): Promise<void> {
    await db.shopifyStore.deleteMany({
      where: { id: storeId, userId },
    })
  }

  /**
   * Teste la connexion à un store Shopify
   */
  static async testConnection(shop: string, accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      })
      return response.ok
    } catch (error) {
      return false
    }
  }


  /**
   * Optimise les données produit pour Google Merchant Center
   */
  static optimizeProductForGMC(product: ShopifyProduct): any {
    // Version simplifiée qui évite les erreurs
    const primaryVariant = product.variants?.[0] || {}
    const primaryImage = product.images?.[0] || {}
    // Nouveau système de scoring: sous-scores + poids
    const weights = { base: 0.5, margin: 0.25, recruitment: 0.25 }

    const baseQualityScore = this.computeBaseQualityScore(product) // 0-50
    const marginScore = this.computeMarginScore(product) // 0-25
    const recruitmentScore = this.computeRecruitmentHeuristicScore(product) // 0-25 (heuristique initiale)

    const score = Math.min(
      Math.max(
        Math.round(
          (baseQualityScore) * weights.base +
          (marginScore) * (weights.margin / 0.25) * 0.25 +
          (recruitmentScore) * (weights.recruitment / 0.25) * 0.25
        ),
        0
      ),
      100
    )
    const recommendations = this.generateImprovementRecommendations(product)
    const contentAnalysis = this.analyzeContent(product)
    const titleVariants = this.generateTitleVariants(product)
    const descriptionVariants = this.generateDescriptionVariants(product)

    // Debug: afficher les données du produit avant mapping
    console.log('🔍 Debug - Produit avant mapping:', {
      id: product.id,
      title: product.title,
      body_html: product.body_html,
      description: product.description,
      vendor: product.vendor,
      product_type: product.product_type,
      productType: product.productType,
      currency: product.currency,
      variants: product.variants?.length,
      images: product.images?.length,
      tags: product.tags,
      collections: product.collections
    });

    return {
      id: product.id?.toString() || '',
      title: product.title || 'Sans titre',
      description: this.cleanHtmlDescription(product.body_html || product.description || 'Aucune description disponible'),
      link: product.handle ? `https://${product.vendor || 'shop'}.myshopify.com/products/${product.handle}` : '',
      image_link: primaryImage?.src || '',
      additional_image_link: product.images?.slice(1, 10).map(img => img?.src || '').filter(Boolean) || [],
      availability: (primaryVariant.inventory_quantity || primaryVariant.inventoryQuantity || 0) > 0 ? 'in stock' : 'out of stock',
      price: `${primaryVariant.price || '0'} ${product.currency || 'EUR'}`,
      sale_price: (primaryVariant.compare_at_price || primaryVariant.compareAtPrice) ? `${primaryVariant.compare_at_price || primaryVariant.compareAtPrice} ${product.currency || 'EUR'}` : undefined,
      brand: product.vendor || 'Marque non spécifiée',
      gtin: primaryVariant.barcode || '',
      mpn: primaryVariant.sku || '',
      condition: 'new',
      product_type: product.product_type || product.productType || 'Type non spécifié',
      google_product_category: this.mapToGoogleCategory(product.product_type || product.productType || ''),
      custom_label_0: Array.isArray(product.tags) ? product.tags.join(',') : (product.tags || ''),
      custom_label_1: Array.isArray(product.collections) ? product.collections.join(',') : (product.collections || ''),
      custom_label_2: score.toString(),
      // Données d'analyse IA
      ai_analysis: {
        score,
        subscores: {
          base_quality: baseQualityScore,
          margin: marginScore,
          recruitment: recruitmentScore,
          weights
        },
        recommendations,
        image_count: product.images?.length || 0,
        description_length: (product.body_html || product.description || '')?.length || 0,
        tags_count: Array.isArray(product.tags) ? product.tags.length : 0,
        collections_count: Array.isArray(product.collections) ? product.collections.length : 0,
        variants_count: product.variants?.length || 0,
        has_stock: (primaryVariant.inventory_quantity || primaryVariant.inventoryQuantity || 0) > 0,
        price_valid: (primaryVariant.price || 0) > 0,
        // Nouvelles analyses de contenu
        content_analysis: contentAnalysis,
        title_variants: titleVariants,
        description_variants: descriptionVariants
      }
    }
  }

  /**
   * Calcule le sous-score de qualité de fiche (0-50)
   */
  private static computeBaseQualityScore(product: ShopifyProduct): number {
    let score = 30 // Base neutre

    try {
      // Bonus pour les produits avec images
      if (product.images && Array.isArray(product.images) && product.images.length > 0) score += 10
      if (product.images && Array.isArray(product.images) && product.images.length > 3) score += 5

      // Bonus pour les descriptions complètes
      const description = product.body_html || product.description || ''
      if (description && typeof description === 'string' && description.length > 100) score += 10
      if (description && typeof description === 'string' && description.length > 500) score += 5

      // Bonus pour les tags
      if (Array.isArray(product.tags) && product.tags.length > 0) score += 5
      if (Array.isArray(product.tags) && product.tags.length > 5) score += 5

      // Bonus pour les collections
      if (Array.isArray(product.collections) && product.collections.length > 0) score += 5

      // Bonus pour les variantes
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 1) score += 5
    } catch (error) {
      console.error('Erreur lors du calcul du score:', error)
      return 30 // Base en cas d'erreur
    }

    return Math.max(0, Math.min(score, 50))
  }

  /**
   * Calcule un sous-score de marge (0-25). Essaie de lire une marge%, sinon heuristique avec compare_at_price.
   */
  private static computeMarginScore(product: ShopifyProduct): number {
    const primaryVariant: any = product.variants?.[0] || {}
    const price = parseFloat(primaryVariant.price || '0')
    const compareAt = parseFloat(primaryVariant.compare_at_price || primaryVariant.compareAtPrice || '0')

    // Heuristique: si compare_at_price > price, utiliser le discount comme proxy de marge
    let estimatedMarginPercent = 0
    if (compareAt && price && compareAt > price) {
      estimatedMarginPercent = Math.max(0, Math.min(90, ((compareAt - price) / compareAt) * 100))
    }

    // Barème continu
    let score = 0
    if (estimatedMarginPercent <= 10) score = 0
    else if (estimatedMarginPercent <= 30) score = 12 * ((estimatedMarginPercent - 10) / 20)
    else if (estimatedMarginPercent <= 60) score = 12 + 10 * ((estimatedMarginPercent - 30) / 30)
    else score = 25

    return Math.max(0, Math.min(25, Math.round(score)))
  }

  /**
   * Nettoie le HTML pour extraire le texte pur
   */
  private static cleanHtmlDescription(html: string): string {
    if (!html) return 'Aucune description disponible'
    
    // Supprimer les balises HTML courantes
    return html
      .replace(/<p[^>]*>/gi, '') // Supprimer <p>
      .replace(/<\/p>/gi, '\n') // Remplacer </p> par un saut de ligne
      .replace(/<br\s*\/?>/gi, '\n') // Remplacer <br> par un saut de ligne
      .replace(/<[^>]*>/g, '') // Supprimer toutes les autres balises
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp; par un espace
      .replace(/&amp;/g, '&') // Remplacer &amp; par &
      .replace(/&lt;/g, '<') // Remplacer &lt; par <
      .replace(/&gt;/g, '>') // Remplacer &gt; par >
      .replace(/\n\s*\n/g, '\n') // Supprimer les lignes vides multiples
      .trim() // Supprimer les espaces en début/fin
  }

  /**
   * Heuristique initiale pour le sous-score recrutement (0-25) en l'absence de stats historiques.
   */
  private static computeRecruitmentHeuristicScore(product: ShopifyProduct): number {
    const primaryVariant: any = product.variants?.[0] || {}
    const price = parseFloat(primaryVariant.price || '0')
    const compareAt = parseFloat(primaryVariant.compare_at_price || primaryVariant.compareAtPrice || '0')
    const discount = compareAt && compareAt > price ? (compareAt - price) / compareAt : 0
    const stock = Number(primaryVariant.inventory_quantity || primaryVariant.inventoryQuantity || 0)
    const variantsCount = Array.isArray(product.variants) ? product.variants.length : 0

    // Prix d'entrée: sans distribution, on donne un léger bonus si discount et variantes
    let priceEntryScore = 0
    if (discount >= 0.2) priceEntryScore = 6
    else if (discount >= 0.1) priceEntryScore = 3

    // Universalité simple via tags/typologie
    const text = `${product.title} ${product.product_type || product.productType || ''} ${Array.isArray(product.tags) ? product.tags.join(' ') : product.tags || ''}`.toLowerCase()
    const universalKeywords = ['basique', 'classique', 'starter', 'kit', 'universel']
    const specificKeywords = ['édition limitée', 'premium', 'luxe']
    let universality = 0
    if (universalKeywords.some(k => text.includes(k))) universality += 4
    if (specificKeywords.some(k => text.includes(k))) universality -= 2
    universality = Math.max(0, Math.min(6, universality))

    // Stock
    const stockScore = Math.max(0, Math.min(4, Math.floor(Math.min(stock / 20, 1) * 4)))

    // Promo
    const promoScore = discount >= 0.2 ? 4 : discount >= 0.1 ? 2 : 0

    // Variantes
    const variantsScore = variantsCount >= 3 ? 3 : variantsCount === 2 ? 1 : 0

    const total = priceEntryScore + universality + stockScore + promoScore + variantsScore
    return Math.max(0, Math.min(25, total))
  }

  /**
   * Génère des recommandations d'amélioration pour un produit
   */
  private static generateImprovementRecommendations(product: ShopifyProduct): string[] {
    const recommendations: string[] = []

    // Vérifier les images
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      recommendations.push('Ajouter au moins une image au produit')
    } else if (product.images.length < 3) {
      recommendations.push('Ajouter plus d\'images (minimum 3 recommandé)')
    }

    // Vérifier la description
    if (!product.description || product.description.length < 100) {
      recommendations.push('Améliorer la description (minimum 100 caractères)')
    } else if (product.description.length < 500) {
      recommendations.push('Enrichir la description avec plus de détails')
    }

    // Vérifier les tags
    if (!Array.isArray(product.tags) || product.tags.length === 0) {
      recommendations.push('Ajouter des tags pour améliorer la visibilité')
    } else if (product.tags.length < 5) {
      recommendations.push('Ajouter plus de tags (minimum 5 recommandé)')
    }

    // Vérifier les collections
    if (!Array.isArray(product.collections) || product.collections.length === 0) {
      recommendations.push('Associer le produit à des collections')
    }

    // Vérifier le stock
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const hasStock = product.variants.some(variant => (variant.inventoryQuantity || 0) > 0)
      if (!hasStock) {
        recommendations.push('Mettre à jour le stock du produit')
      }
    }

    // Vérifier le prix
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      const variant = product.variants[0]
      if (!variant.price || variant.price <= 0) {
        recommendations.push('Définir un prix valide pour le produit')
      }
    }

    return recommendations
  }

  /**
   * Analyse IA du titre et de la description d'un produit
   */
  private static analyzeContent(product: ShopifyProduct): any {
    const analysis = {
      title: {
        current: product.title || '',
        length: (product.title || '').length,
        hasKeywords: false,
        hasBrand: false,
        hasCategory: false,
        suggestions: [] as string[]
      },
      description: {
        current: product.description || '',
        length: (product.description || '').length,
        hasBenefits: false,
        hasFeatures: false,
        hasCallToAction: false,
        suggestions: [] as string[]
      }
    }

    // Analyse du titre
    const title = product.title?.toLowerCase() || ''
    const brand = product.vendor?.toLowerCase() || ''
    const category = product.productType?.toLowerCase() || ''

    // Vérifier la présence d'éléments clés
    analysis.title.hasKeywords = title.includes('nouveau') || title.includes('meilleur') || title.includes('qualité')
    analysis.title.hasBrand = brand && title.includes(brand)
    analysis.title.hasCategory = category && title.includes(category)

    // Suggestions pour le titre
    if (!analysis.title.hasBrand && brand) {
      analysis.title.suggestions.push(`Inclure la marque "${product.vendor}" dans le titre`)
    }
    if (!analysis.title.hasCategory && category) {
      analysis.title.suggestions.push(`Ajouter la catégorie "${product.productType}"`)
    }
    if (title.length < 30) {
      analysis.title.suggestions.push('Titre trop court - ajouter des mots-clés descriptifs')
    }
    if (title.length > 100) {
      analysis.title.suggestions.push('Titre trop long - simplifier pour plus d\'impact')
    }

    // Analyse de la description
    const description = product.description?.toLowerCase() || ''
    
    analysis.description.hasBenefits = description.includes('bénéfice') || description.includes('avantage') || description.includes('pourquoi')
    analysis.description.hasFeatures = description.includes('caractéristique') || description.includes('spécification') || description.includes('détail')
    analysis.description.hasCallToAction = description.includes('acheter') || description.includes('commander') || description.includes('découvrir')

    // Suggestions pour la description
    if (!analysis.description.hasBenefits) {
      analysis.description.suggestions.push('Ajouter les bénéfices et avantages du produit')
    }
    if (!analysis.description.hasFeatures) {
      analysis.description.suggestions.push('Détailler les caractéristiques techniques')
    }
    if (!analysis.description.hasCallToAction) {
      analysis.description.suggestions.push('Ajouter un appel à l\'action (CTA)')
    }
    if (description.length < 200) {
      analysis.description.suggestions.push('Description trop courte - enrichir avec plus de détails')
    }

    return analysis
  }

  /**
   * Génère des variantes de titre optimisées pour A/B testing
   */
  private static generateTitleVariants(product: ShopifyProduct): string[] {
    const variants: string[] = []
    const title = product.title || 'Produit'
    const brand = product.vendor || 'Marque'
    const category = product.productType || 'Catégorie'

    // Variante 1: Focus sur la marque
    variants.push(`${brand} - ${title} | Qualité Premium`)

    // Variante 2: Focus sur la catégorie
    variants.push(`${title} - ${category} de Qualité`)

    // Variante 3: Focus sur les bénéfices
    variants.push(`${title} | Solution ${category} Innovante`)

    // Variante 4: Focus sur l'urgence/rareté
    variants.push(`${title} - ${category} Exclusif ${brand}`)

    // Variante 5: Focus sur la valeur
    variants.push(`${title} | Meilleur ${category} ${brand}`)

    return variants
  }

  /**
   * Génère des variantes de description optimisées pour A/B testing
   */
  private static generateDescriptionVariants(product: ShopifyProduct): string[] {
    const variants: string[] = []
    const title = product.title || 'Produit'
    const brand = product.vendor || 'Marque'
    const category = product.productType || 'Catégorie'

    // Variante 1: Focus sur les bénéfices
    variants.push(
      `Découvrez ${title}, la solution ${category} qui va transformer votre expérience. ` +
      `Avec ${brand}, profitez d'une qualité exceptionnelle et d'un design innovant. ` +
      `Commandez maintenant et bénéficiez de notre garantie satisfaction !`
    )

    // Variante 2: Focus sur les caractéristiques
    variants.push(
      `${title} combine technologie de pointe et design élégant. ` +
      `Spécifications techniques : matériaux premium, finition soignée, garantie étendue. ` +
      `Choisissez ${brand} pour l'excellence en ${category}.`
    )

    // Variante 3: Focus sur l'émotion
    variants.push(
      `Imaginez la perfection avec ${title}. Plus qu'un simple ${category}, ` +
      `c'est une expérience unique signée ${brand}. ` +
      `Offrez-vous l'excellence dès aujourd'hui !`
    )

    return variants
  }

  /**
   * Mappe les types de produits Shopify vers les catégories Google
   */
  private static mapToGoogleCategory(productType: string): string {
    const categoryMap: { [key: string]: string } = {
      'Clothing': 'Apparel & Accessories > Clothing',
      'Shoes': 'Apparel & Accessories > Shoes',
      'Jewelry': 'Apparel & Accessories > Jewelry & Watches',
      'Electronics': 'Electronics',
      'Home & Garden': 'Home & Garden',
      'Sports': 'Sporting Goods',
      'Beauty': 'Health & Beauty',
      'Books': 'Media > Books',
      'Toys': 'Toys & Games',
      'Food': 'Food, Beverages & Tobacco',
    }

    return categoryMap[productType] || 'Apparel & Accessories > Clothing'
  }
} 