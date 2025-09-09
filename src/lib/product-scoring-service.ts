import { openAIService } from './openai-service'

export interface ProductScore {
  overall: number
  title: number
  description: number
  price: number
  images: number
  seo: number
  conversion: number
  recommendations: string[]
}

export interface OptimizedProduct {
  id: string
  original_title: string
  optimized_title: string
  original_description: string
  optimized_description: string
  score: ProductScore
  custom_labels: {
    custom_label_0: string // Score global
    custom_label_1: string // Catégorie de performance
    custom_label_2: string // Recommandations principales
    custom_label_3: string // Mots-clés optimisés
    custom_label_4: string // Métriques de conversion
  }
}

export class ProductScoringService {
  
  /**
   * Scorer un produit individuel
   */
  async scoreProduct(product: any): Promise<ProductScore> {
    try {
      const prompt = `
Analyse ce produit e-commerce et génère un score de performance :

PRODUIT:
- Titre: ${product.title}
- Description: ${product.description}
- Prix: ${product.price?.value} ${product.price?.currency}
- Catégorie: ${product.google_product_category}
- Marque: ${product.brand}
- Disponibilité: ${product.availability}

Évalue chaque aspect sur 100 et génère des recommandations :

Retourne au format JSON :
{
  "overall": 75,
  "title": 80,
  "description": 70,
  "price": 85,
  "images": 90,
  "seo": 75,
  "conversion": 80,
  "recommendations": [
    "Améliorer la description avec plus de détails",
    "Ajouter des mots-clés de recherche",
    "Optimiser le titre pour le SEO"
  ]
}
`

      const response = await openAIService.generateRecommendations({
        prompt,
        campaignType: 'SHOPPING',
        performanceData: [product]
      })

      if (response.recommendations && response.recommendations.length > 0) {
        // Parser la réponse pour extraire le score
        const scoreData = this.parseScoreFromRecommendations(response.recommendations)
        return scoreData
      }

      // Score par défaut si l'IA échoue
      return {
        overall: 70,
        title: 75,
        description: 70,
        price: 80,
        images: 85,
        seo: 70,
        conversion: 75,
        recommendations: [
          'Vérifier la qualité des images',
          'Optimiser le titre pour le SEO',
          'Améliorer la description produit'
        ]
      }
    } catch (error) {
      console.error('Erreur scoring produit:', error)
      return {
        overall: 60,
        title: 65,
        description: 60,
        price: 70,
        images: 75,
        seo: 65,
        conversion: 70,
        recommendations: ['Erreur lors de l\'analyse']
      }
    }
  }

  /**
   * Optimiser un produit avec IA
   */
  async optimizeProduct(product: any): Promise<OptimizedProduct> {
    try {
      const score = await this.scoreProduct(product)
      
      const optimizationPrompt = `
Optimise ce produit e-commerce pour Google Shopping :

PRODUIT ACTUEL:
- Titre: ${product.title}
- Description: ${product.description}
- Score actuel: ${score.overall}/100

Génère des améliorations au format JSON :
{
  "optimized_title": "Titre optimisé avec mots-clés",
  "optimized_description": "Description améliorée avec détails",
  "custom_labels": {
    "custom_label_0": "Score: ${score.overall}/100",
    "custom_label_1": "Performance: ${this.getPerformanceCategory(score.overall)}",
    "custom_label_2": "Top recommandation",
    "custom_label_3": "Mots-clés principaux",
    "custom_label_4": "Métriques: CTR, Conversion"
  }
}
`

      const response = await openAIService.generateRecommendations({
        prompt: optimizationPrompt,
        campaignType: 'SHOPPING',
        performanceData: [product]
      })

      // Optimisations par défaut si l'IA échoue
      const optimizedTitle = this.optimizeTitle(product.title, score)
      const optimizedDescription = this.optimizeDescription(product.description, score)

      return {
        id: product.id,
        original_title: product.title,
        optimized_title: optimizedTitle,
        original_description: product.description,
        optimized_description: optimizedDescription,
        score,
        custom_labels: {
          custom_label_0: `Score: ${score.overall}/100`,
          custom_label_1: this.getPerformanceCategory(score.overall),
          custom_label_2: score.recommendations[0] || 'Optimisation recommandée',
          custom_label_3: this.extractKeywords(product.title),
          custom_label_4: `CTR: ${score.conversion}%, Conv: ${score.overall}%`
        }
      }
    } catch (error) {
      console.error('Erreur optimisation produit:', error)
      
      const defaultScore = await this.scoreProduct(product)
      
      return {
        id: product.id,
        original_title: product.title,
        optimized_title: product.title,
        original_description: product.description,
        optimized_description: product.description,
        score: defaultScore,
        custom_labels: {
          custom_label_0: `Score: ${defaultScore.overall}/100`,
          custom_label_1: this.getPerformanceCategory(defaultScore.overall),
          custom_label_2: 'Optimisation en cours',
          custom_label_3: 'Mots-clés à extraire',
          custom_label_4: 'Métriques à calculer'
        }
      }
    }
  }

  /**
   * Scorer et optimiser un batch de produits
   */
  async processProductBatch(products: any[]): Promise<OptimizedProduct[]> {
    console.log(`🔄 Traitement de ${products.length} produits...`)
    
    const optimizedProducts: OptimizedProduct[] = []
    
    // Traiter par batch de 10 pour éviter les rate limits
    const batchSize = 10
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      const batchPromises = batch.map(product => this.optimizeProduct(product))
      const batchResults = await Promise.all(batchPromises)
      
      optimizedProducts.push(...batchResults)
      
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} traité: ${batchResults.length} produits`)
      
      // Pause entre les batches pour éviter les rate limits
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return optimizedProducts
  }

  /**
   * Parser le score depuis les recommandations IA
   */
  private parseScoreFromRecommendations(recommendations: any[]): ProductScore {
    // Logique de parsing des recommandations IA
    // Pour l'instant, retourner un score par défaut
    return {
      overall: 75,
      title: 80,
      description: 70,
      price: 85,
      images: 90,
      seo: 75,
      conversion: 80,
      recommendations: recommendations.map((rec: any) => rec.title || rec.description || 'Optimisation recommandée')
    }
  }

  /**
   * Optimiser le titre avec des mots-clés
   */
  private optimizeTitle(title: string, score: ProductScore): string {
    if (score.title >= 80) return title
    
    // Ajouter des mots-clés populaires si le score est faible
    const keywords = ['Premium', 'Qualité', 'Professionnel', 'Meilleur']
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
    
    return `${randomKeyword} ${title}`
  }

  /**
   * Optimiser la description
   */
  private optimizeDescription(description: string, score: ProductScore): string {
    if (score.description >= 80) return description
    
    // Améliorer la description si le score est faible
    const improvements = [
      'Produit de haute qualité',
      'Livraison rapide',
      'Garantie satisfait ou remboursé'
    ]
    
    return `${description}. ${improvements.join('. ')}.`
  }

  /**
   * Extraire les mots-clés du titre
   */
  private extractKeywords(title: string): string {
    const words = title.split(' ').slice(0, 3)
    return words.join(', ')
  }

  /**
   * Catégoriser la performance
   */
  private getPerformanceCategory(score: number): string {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Très Bon'
    if (score >= 70) return 'Bon'
    if (score >= 60) return 'Moyen'
    return 'À améliorer'
  }
}

export const productScoringService = new ProductScoringService() 