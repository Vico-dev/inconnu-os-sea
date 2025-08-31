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
  description: string
  vendor: string
  productType: string
  tags: string[]
  status: 'active' | 'archived' | 'draft'
  publishedAt: string
  createdAt: string
  updatedAt: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  collections: string[]
  seo: {
    title: string
    description: string
  }
}

export interface ShopifyVariant {
  id: string
  title: string
  sku: string
  price: string
  compareAtPrice: string
  inventoryQuantity: number
  inventoryPolicy: string
  weight: number
  weightUnit: string
  requiresShipping: boolean
  taxable: boolean
  barcode: string
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

export class ShopifyService {
  private static baseUrl = 'https://api.shopify.com/admin/api/2024-01'

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
   * Récupère les informations du store
   */
  static async getShopInfo(shop: string, accessToken: string): Promise<Partial<ShopifyStore>> {
    // Ajouter .myshopify.com si pas déjà présent
    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    const response = await fetch(`https://${fullShopDomain}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des informations du store')
    }

    const data = await response.json()
    return {
      name: data.shop.name,
      domain: data.shop.domain,
      email: data.shop.email,
      currency: data.shop.currency,
      country: data.shop.country_name,
      timezone: data.shop.timezone,
    }
  }

  /**
   * Récupère tous les produits du store
   */
  static async getProducts(shop: string, accessToken: string, limit: number = 250): Promise<ShopifyProduct[]> {
    // Ajouter .myshopify.com si pas déjà présent
    const fullShopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`
    const products: ShopifyProduct[] = []
    let nextPageInfo: string | null = null

    do {
      const url = nextPageInfo 
        ? `https://${fullShopDomain}/admin/api/2024-01/products.json?limit=${limit}&page_info=${nextPageInfo}`
        : `https://${fullShopDomain}/admin/api/2024-01/products.json?limit=${limit}`

      const response = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits')
      }

      const data = await response.json()
      products.push(...data.products)

      // Récupérer le lien vers la page suivante
      const linkHeader = response.headers.get('Link')
      nextPageInfo = this.extractNextPageInfo(linkHeader)
    } while (nextPageInfo)

    return products
  }

  /**
   * Récupère les collections du store
   */
  static async getCollections(shop: string, accessToken: string): Promise<ShopifyCollection[]> {
    const response = await fetch(`${this.baseUrl}/collections.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des collections')
    }

    const data = await response.json()
    return data.collections
  }

  /**
   * Récupère les produits d'une collection spécifique
   */
  static async getCollectionProducts(shop: string, accessToken: string, collectionId: string): Promise<ShopifyProduct[]> {
    const response = await fetch(`${this.baseUrl}/collections/${collectionId}/products.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits de la collection')
    }

    const data = await response.json()
    return data.products
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
   * Extrait l'information de pagination depuis le header Link
   */
  private static extractNextPageInfo(linkHeader: string | null): string | null {
    if (!linkHeader) return null

    const links = linkHeader.split(',')
    const nextLink = links.find(link => link.includes('rel="next"'))
    
    if (!nextLink) return null

    const match = nextLink.match(/page_info=([^&>]+)/)
    return match ? match[1] : null
  }

  /**
   * Optimise les données produit pour Google Merchant Center
   */
  static optimizeProductForGMC(product: ShopifyProduct): any {
    // Version simplifiée qui évite les erreurs
    const primaryVariant = product.variants?.[0] || {}
    const primaryImage = product.images?.[0] || {}
    const score = this.calculatePerformanceScore(product)
    const recommendations = this.generateImprovementRecommendations(product)

    return {
      id: product.id?.toString() || '',
      title: product.title || '',
      description: product.description || '',
      link: product.handle ? `https://${product.vendor || 'shop'}.myshopify.com/products/${product.handle}` : '',
      image_link: primaryImage?.src || '',
      additional_image_link: product.images?.slice(1, 10).map(img => img?.src || '').filter(Boolean) || [],
      availability: (primaryVariant.inventoryQuantity || 0) > 0 ? 'in stock' : 'out of stock',
      price: `${primaryVariant.price || '0'} ${product.currency || 'EUR'}`,
      sale_price: primaryVariant.compareAtPrice ? `${primaryVariant.compareAtPrice} ${product.currency || 'EUR'}` : undefined,
      brand: product.vendor || '',
      gtin: primaryVariant.barcode || '',
      mpn: primaryVariant.sku || '',
      condition: 'new',
      product_type: product.productType || '',
      google_product_category: this.mapToGoogleCategory(product.productType || ''),
      custom_label_0: Array.isArray(product.tags) ? product.tags.join(',') : (product.tags || ''),
      custom_label_1: Array.isArray(product.collections) ? product.collections.join(',') : (product.collections || ''),
      custom_label_2: score.toString(),
      // Données d'analyse IA
      ai_analysis: {
        score,
        recommendations,
        image_count: product.images?.length || 0,
        description_length: product.description?.length || 0,
        tags_count: Array.isArray(product.tags) ? product.tags.length : 0,
        collections_count: Array.isArray(product.collections) ? product.collections.length : 0,
        variants_count: product.variants?.length || 0,
        has_stock: (primaryVariant.inventoryQuantity || 0) > 0,
        price_valid: (primaryVariant.price || 0) > 0
      }
    }
  }

  /**
   * Calcule un score de performance pour le produit
   */
  private static calculatePerformanceScore(product: ShopifyProduct): number {
    let score = 50 // Score de base

    try {
      // Bonus pour les produits avec images
      if (product.images && Array.isArray(product.images) && product.images.length > 0) score += 10
      if (product.images && Array.isArray(product.images) && product.images.length > 3) score += 5

      // Bonus pour les descriptions complètes
      if (product.description && typeof product.description === 'string' && product.description.length > 100) score += 10
      if (product.description && typeof product.description === 'string' && product.description.length > 500) score += 5

      // Bonus pour les tags
      if (Array.isArray(product.tags) && product.tags.length > 0) score += 5
      if (Array.isArray(product.tags) && product.tags.length > 5) score += 5

      // Bonus pour les collections
      if (Array.isArray(product.collections) && product.collections.length > 0) score += 5

      // Bonus pour les variantes
      if (product.variants && Array.isArray(product.variants) && product.variants.length > 1) score += 5
    } catch (error) {
      console.error('Erreur lors du calcul du score:', error)
      return 50 // Score de base en cas d'erreur
    }

    return Math.min(score, 100)
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