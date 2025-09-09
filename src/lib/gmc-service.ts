import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { GMC_CONFIG, mapShopifyCategoryToGMC, validateGMCProduct } from './gmc-config';
import { GMC_ENV, validateGMCConfig, logGMCConfig } from './gmc-env';

export interface GMCProduct {
  id: string;
  title: string;
  description: string;
  price: {
    value: string;
    currency: string;
  };
  availability: 'in stock' | 'out of stock' | 'preorder';
  brand: string;
  gtin?: string;
  mpn?: string;
  google_product_category?: string;
  custom_labels?: string[];
  condition: 'new' | 'used' | 'refurbished';
  image_link?: string;
  additional_image_links?: string[];
  link?: string;
}

export interface GMCExportResult {
  success: boolean;
  exportedCount: number;
  errors: Array<{
    productId: string;
    error: string;
  }>;
  batchId?: string;
}

export class GMCService {
  private auth: GoogleAuth;
  private merchantapi: any;

  constructor() {
    // Validation de la configuration
    const configValidation = validateGMCConfig();
    if (!configValidation.isValid) {
      console.warn('⚠️ Configuration GMC invalide:', configValidation.errors);
    }
    
    // Affichage de la configuration
    logGMCConfig();
    
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/content'],
      keyFile: GMC_ENV.GOOGLE_APPLICATION_CREDENTIALS || undefined,
    });
  }

  private async getClient() {
    // Mode développement : simuler l'API si pas de credentials
    if (GMC_ENV.GMC_DEV_MODE) {
      console.log('🔄 Mode développement GMC: Simulation de l\'API');
      return this.createMockClient();
    }

    try {
      const authClient = await this.auth.getClient();
      this.merchantapi = google.content({
        version: 'v2',
        auth: authClient,
      });
      return this.merchantapi;
    } catch (error) {
      console.error('❌ Erreur authentification Google:', error);
      console.log('🔄 Fallback vers le mode développement');
      return this.createMockClient();
    }
  }

  private createMockClient() {
    return {
      products: {
        insert: async (params: any) => {
          console.log('🔄 Mock GMC: Insertion de', params.requestBody.products.length, 'produits');
          return {
            data: {
              products: params.requestBody.products.map((p: any) => ({ id: p.id, status: 'active' }))
            }
          };
        },
        get: async (params: any) => {
          console.log('🔄 Mock GMC: Récupération produit', params.productId);
          return {
            data: {
              id: params.productId,
              status: 'active',
              title: 'Produit Mock'
            }
          };
        },
        list: async (params: any) => {
          console.log('🔄 Mock GMC: Liste des produits');
          return {
            data: {
              resources: [
                { id: 'mock_1', title: 'Produit Mock 1', status: 'active' },
                { id: 'mock_2', title: 'Produit Mock 2', status: 'active' }
              ]
            }
          };
        }
      }
    };
  }

  private mapShopifyToGMC(shopifyProduct: any): GMCProduct {
    const variant = shopifyProduct.variants?.[0] || {};
    const image = shopifyProduct.images?.[0] || {};
    
    // Validation du produit avant mapping
    const validation = validateGMCProduct({
      id: shopifyProduct.id,
      title: shopifyProduct.title,
      price: { value: variant.price },
      availability: this.mapAvailability(variant.inventory_quantity),
      brand: shopifyProduct.vendor,
    });
    
    if (!validation.isValid) {
      console.warn(`Produit ${shopifyProduct.id} invalide:`, validation.errors);
    }
    
    return {
      id: shopifyProduct.id.toString(),
      title: (shopifyProduct.title || 'Sans titre').substring(0, GMC_CONFIG.MAX_TITLE_LENGTH),
      description: this.cleanHtml(shopifyProduct.body_html || ''),
      price: {
        value: variant.price || '0.00',
        currency: 'EUR',
      },
      availability: this.mapAvailability(variant.inventory_quantity),
      brand: shopifyProduct.vendor || 'Marque inconnue',
      gtin: variant.barcode || undefined,
      mpn: variant.sku || undefined,
      google_product_category: mapShopifyCategoryToGMC(shopifyProduct.product_type, shopifyProduct.tags),
      custom_labels: this.buildCustomLabels(shopifyProduct),
      condition: 'new',
      image_link: image.src || undefined,
      additional_image_links: shopifyProduct.images?.slice(1).map((img: any) => img.src) || undefined,
      link: `${process.env.SHOPIFY_STORE_URL}/products/${shopifyProduct.handle}`,
    };
  }

  private cleanHtml(html: string): string {
    if (!html) return '';
    // Supprimer les balises HTML et nettoyer le texte
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, GMC_CONFIG.MAX_DESCRIPTION_LENGTH);
  }

  private mapAvailability(quantity: number): 'in stock' | 'out of stock' | 'preorder' {
    if (quantity > 0) return 'in stock';
    return 'out of stock';
  }

  private buildCustomLabels(shopifyProduct: any): string[] {
    const labels: string[] = [];
    
    // Label 0: Score de performance
    if (shopifyProduct.custom_label_2) {
      labels.push(`Score: ${shopifyProduct.custom_label_2}`);
    }
    
    // Label 1: Statut d'optimisation
    if (shopifyProduct.ai_analysis) {
      labels.push('IA Optimisé');
    } else {
      labels.push('À optimiser');
    }
    
    // Label 2: Date d'analyse
    if (shopifyProduct.ai_analysis?.date) {
      labels.push(`Analyse: ${new Date(shopifyProduct.ai_analysis.date).toLocaleDateString('fr-FR')}`);
    }
    
    // Label 3: Qualité du produit
    if (shopifyProduct.ai_analysis?.subscores) {
      const totalScore = shopifyProduct.ai_analysis.subscores.base_quality + 
                        shopifyProduct.ai_analysis.subscores.margin + 
                        shopifyProduct.ai_analysis.subscores.recruitment;
      labels.push(`Qualité: ${totalScore}/100`);
    }
    
    // Label 4: Potentiel de conversion
    if (shopifyProduct.ai_analysis?.recommendations) {
      labels.push(`Recos: ${shopifyProduct.ai_analysis.recommendations.length}`);
    }
    
    return labels;
  }

  async exportProducts(products: any[], merchantId: string): Promise<GMCExportResult> {
    try {
      const client = await this.getClient();
      const gmcProducts = products.map(this.mapShopifyToGMC.bind(this));
      
      // Export par batch selon la configuration
      const batchSize = GMC_ENV.GMC_BATCH_SIZE;
      const batches = [];
      
      for (let i = 0; i < gmcProducts.length; i += batchSize) {
        batches.push(gmcProducts.slice(i, i + batchSize));
      }

      let totalExported = 0;
      const errors: Array<{ productId: string; error: string }> = [];

      for (const batch of batches) {
        try {
          const response = await client.products.insert({
            merchantId,
            requestBody: {
              products: batch,
            },
          });

          if (response.data.products) {
            totalExported += response.data.products.length;
          }
        } catch (error: any) {
          console.error('Erreur export batch GMC:', error);
          // Ajouter les erreurs pour chaque produit du batch
          batch.forEach(product => {
            errors.push({
              productId: product.id,
              error: error.message || 'Erreur export GMC',
            });
          });
        }
      }

      return {
        success: errors.length === 0,
        exportedCount: totalExported,
        errors,
      };
    } catch (error: any) {
      console.error('Erreur export GMC:', error);
      return {
        success: false,
        exportedCount: 0,
        errors: [{
          productId: 'batch',
          error: error.message || 'Erreur export GMC',
        }],
      };
    }
  }

  async getExportStatus(merchantId: string, batchId?: string) {
    try {
      const client = await this.getClient();
      
      if (batchId) {
        // Vérifier le statut d'un batch spécifique
        const response = await client.products.get({
          merchantId,
          productId: batchId,
        });
        return response.data;
      } else {
        // Lister les produits exportés
        const response = await client.products.list({
          merchantId,
          maxResults: 50,
        });
        return response.data;
      }
    } catch (error) {
      console.error('Erreur récupération statut GMC:', error);
      throw error;
    }
  }
} 

// Instance singleton
export const gmcService = new GMCService(); 