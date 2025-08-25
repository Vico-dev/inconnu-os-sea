import { GoogleAdsService } from './google-ads-service'
import { db } from './db'

export interface ABTest {
  id: string
  name: string
  description: string
  campaignId: string
  type: 'CREATIVE' | 'KEYWORD' | 'TARGETING' | 'BIDDING'
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'PAUSED'
  startDate: Date
  endDate: Date
  trafficSplit: number // Pourcentage pour la variante A (50 = 50/50)
  
  // Variantes
  variantA: {
    name: string
    description: string
    settings: any
    performance?: {
      impressions: number
      clicks: number
      conversions: number
      cost: number
      ctr: number
      cpc: number
      cpa: number
      roas: number
    }
  }
  
  variantB: {
    name: string
    description: string
    settings: any
    performance?: {
      impressions: number
      clicks: number
      conversions: number
      cost: number
      ctr: number
      cpc: number
      cpa: number
      roas: number
    }
  }
  
  // Résultats
  results?: {
    winner: 'A' | 'B' | 'TIE' | null
    confidence: number
    improvement: number
    recommendation: string
  }
  
  // Métadonnées
  clientAccountId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ABTestResult {
  testId: string
  variantA: {
    impressions: number
    clicks: number
    conversions: number
    cost: number
    ctr: number
    cpc: number
    cpa: number
    roas: number
  }
  variantB: {
    impressions: number
    clicks: number
    conversions: number
    cost: number
    ctr: number
    cpc: number
    cpa: number
    roas: number
  }
  winner: 'A' | 'B' | 'TIE' | null
  confidence: number
  improvement: number
  recommendation: string
}

export class ABTestingService {
  /**
   * Crée un nouveau test A/B
   */
  static async createABTest(testData: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ABTest> {
    try {
      // Valider les données
      if (testData.trafficSplit < 10 || testData.trafficSplit > 90) {
        throw new Error('Le split de trafic doit être entre 10% et 90%')
      }

      if (testData.startDate >= testData.endDate) {
        throw new Error('La date de fin doit être après la date de début')
      }

      // Créer le test dans la base de données
      const abTest = await db.aBTest.create({
        data: {
          name: testData.name,
          description: testData.description,
          campaignId: testData.campaignId,
          type: testData.type,
          status: testData.status,
          startDate: testData.startDate,
          endDate: testData.endDate,
          trafficSplit: testData.trafficSplit,
          variantA: testData.variantA,
          variantB: testData.variantB,
          clientAccountId: testData.clientAccountId,
          createdBy: testData.createdBy
        }
      })

      // Si le test doit démarrer immédiatement, lancer l'implémentation
      if (testData.status === 'RUNNING') {
        await this.startABTest(abTest.id)
      }

      return abTest
    } catch (error) {
      console.error('Erreur lors de la création du test A/B:', error)
      throw error
    }
  }

  /**
   * Démarre un test A/B
   */
  static async startABTest(testId: string): Promise<void> {
    try {
      const test = await db.aBTest.findUnique({
        where: { id: testId },
        include: {
          campaign: {
            include: {
              clientAccount: {
                include: {
                  googleAdsConnection: true
                }
              }
            }
          }
        }
      })

      if (!test) {
        throw new Error('Test A/B non trouvé')
      }

      if (test.status !== 'DRAFT') {
        throw new Error('Le test ne peut être démarré que s\'il est en brouillon')
      }

      // Vérifier la connexion Google Ads
      if (!test.campaign.clientAccount.googleAdsConnection) {
        throw new Error('Connexion Google Ads requise pour démarrer le test')
      }

      const { customerId, refreshToken } = test.campaign.clientAccount.googleAdsConnection

      // Implémenter le test selon le type
      switch (test.type) {
        case 'CREATIVE':
          await this.implementCreativeTest(test, customerId, refreshToken)
          break
        case 'KEYWORD':
          await this.implementKeywordTest(test, customerId, refreshToken)
          break
        case 'TARGETING':
          await this.implementTargetingTest(test, customerId, refreshToken)
          break
        case 'BIDDING':
          await this.implementBiddingTest(test, customerId, refreshToken)
          break
        default:
          throw new Error('Type de test non supporté')
      }

      // Mettre à jour le statut
      await db.aBTest.update({
        where: { id: testId },
        data: { status: 'RUNNING' }
      })

    } catch (error) {
      console.error('Erreur lors du démarrage du test A/B:', error)
      throw error
    }
  }

  /**
   * Arrête un test A/B
   */
  static async stopABTest(testId: string): Promise<void> {
    try {
      const test = await db.aBTest.findUnique({
        where: { id: testId },
        include: {
          campaign: {
            include: {
              clientAccount: {
                include: {
                  googleAdsConnection: true
                }
              }
            }
          }
        }
      })

      if (!test) {
        throw new Error('Test A/B non trouvé')
      }

      if (test.status !== 'RUNNING') {
        throw new Error('Le test n\'est pas en cours d\'exécution')
      }

      // Arrêter le test dans Google Ads
      const { customerId, refreshToken } = test.campaign.clientAccount.googleAdsConnection
      await this.stopGoogleAdsTest(test, customerId, refreshToken)

      // Calculer les résultats
      const results = await this.calculateTestResults(testId)

      // Mettre à jour le statut et les résultats
      await db.aBTest.update({
        where: { id: testId },
        data: {
          status: 'COMPLETED',
          results
        }
      })

    } catch (error) {
      console.error('Erreur lors de l\'arrêt du test A/B:', error)
      throw error
    }
  }

  /**
   * Calcule les résultats d'un test A/B
   */
  static async calculateTestResults(testId: string): Promise<ABTestResult> {
    try {
      const test = await db.aBTest.findUnique({
        where: { id: testId },
        include: {
          campaign: {
            include: {
              clientAccount: {
                include: {
                  googleAdsConnection: true
                }
              }
            }
          }
        }
      })

      if (!test) {
        throw new Error('Test A/B non trouvé')
      }

      const { customerId, refreshToken } = test.campaign.clientAccount.googleAdsConnection

      // Récupérer les performances des variantes
      const variantAPerformance = await this.getVariantPerformance(test, 'A', customerId, refreshToken)
      const variantBPerformance = await this.getVariantPerformance(test, 'B', customerId, refreshToken)

      // Calculer le gagnant
      const winner = this.determineWinner(variantAPerformance, variantBPerformance)
      const confidence = this.calculateConfidence(variantAPerformance, variantBPerformance)
      const improvement = this.calculateImprovement(variantAPerformance, variantBPerformance)
      const recommendation = this.generateRecommendation(test, winner, improvement)

      return {
        testId,
        variantA: variantAPerformance,
        variantB: variantBPerformance,
        winner,
        confidence,
        improvement,
        recommendation
      }

    } catch (error) {
      console.error('Erreur lors du calcul des résultats:', error)
      throw error
    }
  }

  /**
   * Récupère les tests A/B d'un client
   */
  static async getClientABTests(clientAccountId: string): Promise<ABTest[]> {
    return await db.aBTest.findMany({
      where: { clientAccountId },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Récupère un test A/B par ID
   */
  static async getABTest(testId: string): Promise<ABTest | null> {
    return await db.aBTest.findUnique({
      where: { id: testId }
    })
  }

  /**
   * Implémente un test de créatifs
   */
  private static async implementCreativeTest(test: any, customerId: string, refreshToken: string): Promise<void> {
    try {
      const customer = GoogleAdsService.createCustomer(customerId, refreshToken)

      // Créer des groupes d'annonces séparés pour chaque variante
      const adGroupA = await customer.adGroup.create({
        create: {
          name: `${test.campaign.name} - Test A/B Variante A`,
          campaign: `customers/${customerId}/campaigns/${test.campaign.googleAdsCampaignId}`,
          status: 'ENABLED',
          type: 'SEARCH_STANDARD'
        }
      })

      const adGroupB = await customer.adGroup.create({
        create: {
          name: `${test.campaign.name} - Test A/B Variante B`,
          campaign: `customers/${customerId}/campaigns/${test.campaign.googleAdsCampaignId}`,
          status: 'ENABLED',
          type: 'SEARCH_STANDARD'
        }
      })

      // Créer les annonces pour chaque variante
      if (test.variantA.settings.headlines && test.variantA.settings.descriptions) {
        await customer.adGroupAd.create({
          create: {
            ad_group: adGroupA.results[0].resource_name,
            ad: {
              type: 'RESPONSIVE_SEARCH_AD',
              responsive_search_ad: {
                headlines: test.variantA.settings.headlines.map((headline: string) => ({
                  text: headline,
                  pin: 'UNPINNED'
                })),
                descriptions: test.variantA.settings.descriptions.map((desc: string) => ({
                  text: desc
                }))
              }
            }
          }
        })
      }

      if (test.variantB.settings.headlines && test.variantB.settings.descriptions) {
        await customer.adGroupAd.create({
          create: {
            ad_group: adGroupB.results[0].resource_name,
            ad: {
              type: 'RESPONSIVE_SEARCH_AD',
              responsive_search_ad: {
                headlines: test.variantB.settings.headlines.map((headline: string) => ({
                  text: headline,
                  pin: 'UNPINNED'
                })),
                descriptions: test.variantB.settings.descriptions.map((desc: string) => ({
                  text: desc
                }))
              }
            }
          }
        })
      }

      // Mettre à jour les IDs des groupes d'annonces dans le test
      await db.aBTest.update({
        where: { id: test.id },
        data: {
          variantA: {
            ...test.variantA,
            adGroupId: adGroupA.results[0].resource_name.split('/').pop()
          },
          variantB: {
            ...test.variantB,
            adGroupId: adGroupB.results[0].resource_name.split('/').pop()
          }
        }
      })

    } catch (error) {
      console.error('Erreur lors de l\'implémentation du test de créatifs:', error)
      throw error
    }
  }

  /**
   * Implémente un test de mots-clés
   */
  private static async implementKeywordTest(test: any, customerId: string, refreshToken: string): Promise<void> {
    try {
      const customer = GoogleAdsService.createCustomer(customerId, refreshToken)

      // Créer des groupes d'annonces séparés
      const adGroupA = await customer.adGroup.create({
        create: {
          name: `${test.campaign.name} - Test A/B Mots-clés A`,
          campaign: `customers/${customerId}/campaigns/${test.campaign.googleAdsCampaignId}`,
          status: 'ENABLED',
          type: 'SEARCH_STANDARD'
        }
      })

      const adGroupB = await customer.adGroup.create({
        create: {
          name: `${test.campaign.name} - Test A/B Mots-clés B`,
          campaign: `customers/${customerId}/campaigns/${test.campaign.googleAdsCampaignId}`,
          status: 'ENABLED',
          type: 'SEARCH_STANDARD'
        }
      })

      // Ajouter les mots-clés pour chaque variante
      if (test.variantA.settings.keywords) {
        const keywordOperations = test.variantA.settings.keywords.map((keyword: string) => ({
          create: {
            ad_group: adGroupA.results[0].resource_name,
            keyword: {
              text: keyword,
              match_type: 'BROAD'
            }
          }
        }))
        await customer.adGroupCriterion.create(keywordOperations)
      }

      if (test.variantB.settings.keywords) {
        const keywordOperations = test.variantB.settings.keywords.map((keyword: string) => ({
          create: {
            ad_group: adGroupB.results[0].resource_name,
            keyword: {
              text: keyword,
              match_type: 'BROAD'
            }
          }
        }))
        await customer.adGroupCriterion.create(keywordOperations)
      }

      // Mettre à jour les IDs des groupes d'annonces
      await db.aBTest.update({
        where: { id: test.id },
        data: {
          variantA: {
            ...test.variantA,
            adGroupId: adGroupA.results[0].resource_name.split('/').pop()
          },
          variantB: {
            ...test.variantB,
            adGroupId: adGroupB.results[0].resource_name.split('/').pop()
          }
        }
      })

    } catch (error) {
      console.error('Erreur lors de l\'implémentation du test de mots-clés:', error)
      throw error
    }
  }

  /**
   * Implémente un test de ciblage
   */
  private static async implementTargetingTest(test: any, customerId: string, refreshToken: string): Promise<void> {
    // Implémentation pour les tests de ciblage (audiences, localisations, etc.)
    console.log('Test de ciblage à implémenter')
  }

  /**
   * Implémente un test d'enchères
   */
  private static async implementBiddingTest(test: any, customerId: string, refreshToken: string): Promise<void> {
    // Implémentation pour les tests d'enchères
    console.log('Test d\'enchères à implémenter')
  }

  /**
   * Arrête un test dans Google Ads
   */
  private static async stopGoogleAdsTest(test: any, customerId: string, refreshToken: string): Promise<void> {
    try {
      const customer = GoogleAdsService.createCustomer(customerId, refreshToken)

      // Pauser les groupes d'annonces des variantes
      if (test.variantA.adGroupId) {
        await customer.adGroup.update({
          update: {
            resource_name: `customers/${customerId}/adGroups/${test.variantA.adGroupId}`,
            status: 'PAUSED'
          }
        })
      }

      if (test.variantB.adGroupId) {
        await customer.adGroup.update({
          update: {
            resource_name: `customers/${customerId}/adGroups/${test.variantB.adGroupId}`,
            status: 'PAUSED'
          }
        })
      }

    } catch (error) {
      console.error('Erreur lors de l\'arrêt du test Google Ads:', error)
      throw error
    }
  }

  /**
   * Récupère les performances d'une variante
   */
  private static async getVariantPerformance(test: any, variant: 'A' | 'B', customerId: string, refreshToken: string): Promise<any> {
    try {
      const adGroupId = variant === 'A' ? test.variantA.adGroupId : test.variantB.adGroupId
      
      if (!adGroupId) {
        return this.getDefaultPerformance()
      }

      const customer = GoogleAdsService.createCustomer(customerId, refreshToken)
      
      const query = `
        SELECT 
          ad_group.id,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc_micros,
          metrics.conversions_from_interactions_rate,
          metrics.value_per_conversion
        FROM ad_group 
        WHERE ad_group.id = ${adGroupId}
        AND segments.date BETWEEN '${test.startDate.toISOString().split('T')[0]}' AND '${test.endDate.toISOString().split('T')[0]}'
      `

      const response = await customer.query(query)
      
      if (response.length === 0) {
        return this.getDefaultPerformance()
      }

      const row = response[0]
      const cost = row.metrics.cost_micros / 1000000
      const cpc = row.metrics.average_cpc_micros / 1000000
      const conversions = row.metrics.conversions || 0
      const cpa = conversions > 0 ? cost / conversions : 0
      const roas = conversions > 0 ? (conversions * 50) / cost : 0 // Valeur moyenne par conversion estimée

      return {
        impressions: row.metrics.impressions || 0,
        clicks: row.metrics.clicks || 0,
        conversions,
        cost,
        ctr: row.metrics.ctr || 0,
        cpc,
        cpa,
        roas
      }

    } catch (error) {
      console.error(`Erreur lors de la récupération des performances de la variante ${variant}:`, error)
      return this.getDefaultPerformance()
    }
  }

  /**
   * Détermine le gagnant du test
   */
  private static determineWinner(variantA: any, variantB: any): 'A' | 'B' | 'TIE' | null {
    // Critère principal : ROAS
    const roasA = variantA.roas || 0
    const roasB = variantB.roas || 0
    
    if (roasA > roasB * 1.05) return 'A' // 5% d'amélioration minimum
    if (roasB > roasA * 1.05) return 'B'
    
    // Critère secondaire : CPA
    const cpaA = variantA.cpa || 0
    const cpaB = variantB.cpa || 0
    
    if (cpaA < cpaB * 0.95) return 'A' // 5% d'amélioration minimum
    if (cpaB < cpaA * 0.95) return 'B'
    
    return 'TIE'
  }

  /**
   * Calcule le niveau de confiance
   */
  private static calculateConfidence(variantA: any, variantB: any): number {
    // Calcul basique du niveau de confiance basé sur le nombre d'impressions
    const totalImpressions = (variantA.impressions || 0) + (variantB.impressions || 0)
    
    if (totalImpressions < 1000) return 0.3
    if (totalImpressions < 5000) return 0.6
    if (totalImpressions < 10000) return 0.8
    return 0.95
  }

  /**
   * Calcule l'amélioration
   */
  private static calculateImprovement(variantA: any, variantB: any): number {
    const roasA = variantA.roas || 0
    const roasB = variantB.roas || 0
    
    if (roasA > roasB) {
      return ((roasA - roasB) / roasB) * 100
    } else if (roasB > roasA) {
      return ((roasB - roasA) / roasA) * 100
    }
    
    return 0
  }

  /**
   * Génère une recommandation
   */
  private static generateRecommendation(test: any, winner: 'A' | 'B' | 'TIE' | null, improvement: number): string {
    if (winner === 'A') {
      return `La variante A "${test.variantA.name}" est gagnante avec ${improvement.toFixed(1)}% d'amélioration. Recommandation : implémenter cette variante.`
    } else if (winner === 'B') {
      return `La variante B "${test.variantB.name}" est gagnante avec ${improvement.toFixed(1)}% d'amélioration. Recommandation : implémenter cette variante.`
    } else if (winner === 'TIE') {
      return 'Aucune variante ne montre de différence significative. Recommandation : continuer avec la variante actuelle ou tester d\'autres hypothèses.'
    } else {
      return 'Pas assez de données pour déterminer un gagnant. Recommandation : prolonger le test ou augmenter le budget.'
    }
  }

  /**
   * Retourne des performances par défaut
   */
  private static getDefaultPerformance() {
    return {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      roas: 0
    }
  }
} 