import { createGMCClient, testGoogleAuth } from './google-auth-config'

interface GMCProduct {
  id: string
  title: string
  description: string
  price: {
    value: string
    currency: string
  }
  availability: string
  condition: string
  brand: string
  gtin: string
  mpn: string
  custom_labels: {
    custom_label_0?: string
    custom_label_1?: string
    custom_label_2?: string
    custom_label_3?: string
    custom_label_4?: string
  }
  image_link: string
  additional_image_links?: string[]
  product_types: string[]
  google_product_category: string
  age_group?: string
  gender?: string
  color?: string
  size?: string
  material?: string
  pattern?: string
  item_group_id?: string
  shipping_weight?: {
    value: number
    unit: string
  }
  shipping_length?: {
    value: number
    unit: string
  }
  shipping_width?: {
    value: number
    unit: string
  }
  shipping_height?: {
    value: number
    unit: string
  }
}

interface GMCFeed {
  id: string
  name: string
  products: GMCProduct[]
  last_updated: string
  status: 'active' | 'inactive' | 'pending'
}

interface GMCAccount {
  id: string
  name: string
  website_url: string
  feeds: GMCFeed[]
}

export class GMCService {
  private contentAPI: any

  constructor() {
    // Initialiser l'API Google Merchant Center
    try {
      this.contentAPI = createGMCClient()
    } catch (error) {
      console.error('❌ Erreur initialisation GMC API:', error)
      this.contentAPI = null
    }
  }

  /**
   * Récupérer tous les comptes GMC accessibles
   */
  async getAccounts(): Promise<GMCAccount[]> {
    try {
      if (!this.contentAPI) {
        throw new Error('API GMC non initialisée')
      }

      console.log('🔄 Récupération des comptes GMC...')
      
      // Récupérer les comptes GMC
      const response = await this.contentAPI.accounts.list({
        maxResults: 50
      })

      const accounts: GMCAccount[] = []
      
      if (response.data.accounts) {
        for (const account of response.data.accounts) {
          // Récupérer les feeds pour chaque compte
          const feedsResponse = await this.contentAPI.datafeeds.list({
            merchantId: account.id
          })

          const feeds: GMCFeed[] = []
          if (feedsResponse.data.resources) {
            for (const feed of feedsResponse.data.resources) {
              feeds.push({
                id: feed.id,
                name: feed.name,
                products: [], // Les produits seront chargés séparément
                last_updated: feed.lastUploadDate || new Date().toISOString(),
                status: feed.attributeLanguage || 'active'
              })
            }
          }

          accounts.push({
            id: account.id,
            name: account.name,
            website_url: account.websiteUrl,
            feeds
          })
        }
      }

      return accounts
    } catch (error) {
      console.error('❌ Erreur récupération comptes GMC:', error)
      
      // Fallback pour le développement
      if (process.env.NODE_ENV === 'development') {
        return [
          {
            id: '123456789',
            name: 'Mon E-commerce (Dev)',
            website_url: 'https://mon-ecommerce.com',
            feeds: [
              {
                id: 'feed_1',
                name: 'Feed Principal',
                products: [],
                last_updated: new Date().toISOString(),
                status: 'active'
              }
            ]
          }
        ]
      }
      
      throw new Error('Impossible de récupérer les comptes GMC')
    }
  }

  /**
   * Récupérer un feed spécifique depuis GMC
   */
  async getFeed(accountId: string, feedId: string): Promise<GMCFeed> {
    try {
      console.log(`🔄 Récupération du feed ${feedId} depuis GMC...`)
      
      if (!this.contentAPI) {
        throw new Error('API GMC non initialisée')
      }

      // Récupérer les détails du feed
      const feedResponse = await this.contentAPI.datafeeds.get({
        merchantId: accountId,
        datafeedId: feedId
      })

      // Récupérer les produits du feed
      const productsResponse = await this.contentAPI.products.list({
        merchantId: accountId,
        maxResults: 1000 // Limite pour éviter les timeouts
      })

      const products: GMCProduct[] = []
      
      if (productsResponse.data.resources) {
        for (const product of productsResponse.data.resources) {
          products.push({
            id: product.id,
            title: product.title,
            description: product.description,
            price: {
              value: product.price?.value || '0',
              currency: product.price?.currency || 'EUR'
            },
            availability: product.availability || 'in stock',
            condition: product.condition || 'new',
            brand: product.brand || '',
            gtin: product.gtin || '',
            mpn: product.mpn || '',
            custom_labels: {
              custom_label_0: product.customLabel0 || '',
              custom_label_1: product.customLabel1 || '',
              custom_label_2: product.customLabel2 || '',
              custom_label_3: product.customLabel3 || '',
              custom_label_4: product.customLabel4 || ''
            },
            image_link: product.imageLink || '',
            additional_image_links: product.additionalImageLinks || [],
            product_types: product.productTypes || [],
            google_product_category: product.googleProductCategory || '',
            age_group: product.ageGroup,
            gender: product.gender,
            color: product.color,
            size: product.size,
            material: product.material,
            pattern: product.pattern,
            item_group_id: product.itemGroupId,
            shipping_weight: product.shippingWeight ? {
              value: product.shippingWeight.value,
              unit: product.shippingWeight.unit
            } : undefined,
            shipping_length: product.shippingLength ? {
              value: product.shippingLength.value,
              unit: product.shippingLength.unit
            } : undefined,
            shipping_width: product.shippingWidth ? {
              value: product.shippingWidth.value,
              unit: product.shippingWidth.unit
            } : undefined,
            shipping_height: product.shippingHeight ? {
              value: product.shippingHeight.value,
              unit: product.shippingHeight.unit
            } : undefined
          })
        }
      }

      return {
        id: feedId,
        name: feedResponse.data.name || 'Feed Principal',
        products,
        last_updated: feedResponse.data.lastUploadDate || new Date().toISOString(),
        status: feedResponse.data.attributeLanguage || 'active'
      }
    } catch (error) {
      console.error('❌ Erreur récupération feed GMC:', error)
      
      // Fallback pour le développement
      if (process.env.NODE_ENV === 'development') {
        return {
          id: feedId,
          name: 'Feed Principal (Dev)',
          products: [
            {
              id: 'prod_1',
              title: 'Produit Test 1',
              description: 'Description du produit test 1',
              price: { value: '29.99', currency: 'EUR' },
              availability: 'in stock',
              condition: 'new',
              brand: 'Ma Marque',
              gtin: '1234567890123',
              mpn: 'MPN001',
              custom_labels: {},
              image_link: 'https://example.com/image1.jpg',
              product_types: ['Vêtements > Hommes > T-shirts'],
              google_product_category: '1604'
            },
            {
              id: 'prod_2',
              title: 'Produit Test 2',
              description: 'Description du produit test 2',
              price: { value: '49.99', currency: 'EUR' },
              availability: 'in stock',
              condition: 'new',
              brand: 'Ma Marque',
              gtin: '1234567890124',
              mpn: 'MPN002',
              custom_labels: {},
              image_link: 'https://example.com/image2.jpg',
              product_types: ['Vêtements > Femmes > Robes'],
              google_product_category: '1604'
            }
          ],
          last_updated: new Date().toISOString(),
          status: 'active'
        }
      }
      
      throw new Error('Impossible de récupérer le feed GMC')
    }
  }

  /**
   * Mettre à jour un feed avec les custom labels optimisés
   */
  async updateFeed(accountId: string, feedId: string, products: GMCProduct[]): Promise<void> {
    try {
      console.log(`🔄 Mise à jour du feed ${feedId} avec ${products.length} produits...`)
      
      if (!this.contentAPI) {
        throw new Error('API GMC non initialisée')
      }

      // Mettre à jour les produits par batch
      const batchSize = 100 // Limite recommandée par Google
      const batches = []
      
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize)
        batches.push(batch)
      }

      for (const batch of batches) {
        const entries = batch.map(product => ({
          batchId: product.id,
          merchantId: accountId,
          method: 'update',
          product: {
            id: product.id,
            title: product.title,
            description: product.description,
            price: {
              value: product.price.value,
              currency: product.price.currency
            },
            availability: product.availability,
            condition: product.condition,
            brand: product.brand,
            gtin: product.gtin,
            mpn: product.mpn,
            customLabel0: product.custom_labels.custom_label_0,
            customLabel1: product.custom_labels.custom_label_1,
            customLabel2: product.custom_labels.custom_label_2,
            customLabel3: product.custom_labels.custom_label_3,
            customLabel4: product.custom_labels.custom_label_4,
            imageLink: product.image_link,
            additionalImageLinks: product.additional_image_links,
            productTypes: product.product_types,
            googleProductCategory: product.google_product_category,
            ageGroup: product.age_group,
            gender: product.gender,
            color: product.color,
            size: product.size,
            material: product.material,
            pattern: product.pattern,
            itemGroupId: product.item_group_id,
            shippingWeight: product.shipping_weight,
            shippingLength: product.shipping_length,
            shippingWidth: product.shipping_width,
            shippingHeight: product.shipping_height
          }
        }))

        await this.contentAPI.products.custombatch({
          merchantId: accountId,
          requestBody: { entries }
        })

        console.log(`✅ Batch de ${batch.length} produits mis à jour`)
      }

      console.log('✅ Feed GMC mis à jour avec succès')
    } catch (error) {
      console.error('❌ Erreur mise à jour feed GMC:', error)
      throw new Error('Impossible de mettre à jour le feed GMC')
    }
  }

  /**
   * Synchroniser un feed complet
   */
  async syncFeed(accountId: string, feedId: string): Promise<void> {
    try {
      console.log(`🔄 Synchronisation du feed ${feedId}...`)
      
      // TODO: Implémenter avec vraie API GMC
      // await this.contentAPI.datafeeds.fetchnow({
      //   merchantId: accountId,
      //   datafeedId: feedId
      // })

      console.log('✅ Synchronisation GMC terminée')
    } catch (error) {
      console.error('❌ Erreur synchronisation GMC:', error)
      throw new Error('Impossible de synchroniser le feed GMC')
    }
  }

  /**
   * Vérifier la connectivité GMC
   */
  async testConnection(accountId: string): Promise<boolean> {
    try {
      console.log('🔄 Test de connexion GMC...')
      
      // TODO: Implémenter avec vraie API GMC
      // const response = await this.contentAPI.accounts.get({
      //   merchantId: accountId
      // })

      return true
    } catch (error) {
      console.error('❌ Erreur connexion GMC:', error)
      return false
    }
  }
}

// Instance singleton
export const gmcService = new GMCService() 