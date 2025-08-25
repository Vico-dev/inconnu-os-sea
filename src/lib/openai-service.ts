import OpenAI from 'openai'

// Initialiser OpenAI seulement si la clé API est disponible
let openai: OpenAI | null = null

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export interface AIGenerationRequest {
  type: 'keywords' | 'headlines' | 'descriptions' | 'optimization'
  industry: string
  website: string
  goals: string[]
  budget?: number
  context?: string
}

export interface AIGenerationResponse {
  content: string[]
  suggestions: string[]
  confidence: number
}

export class OpenAIService {
  
  // 🔍 GÉNÉRATION DE MOTS-CLÉS
  async generateKeywords(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // Vérifier si OpenAI est disponible
      if (!openai) {
        console.log('⚠️ OpenAI non configuré, utilisation des données simulées')
        return this.getSimulatedKeywords(request)
      }

      const prompt = `
Tu es un expert en Google Ads spécialisé dans la génération de mots-clés optimisés.

Contexte:
- Industrie: ${request.industry}
- Site web: ${request.website}
- Objectifs: ${request.goals.join(', ')}
- Budget: ${request.budget || 'Non spécifié'}€/jour

Génère une liste de 15-20 mots-clés Google Ads optimisés, organisés par type:

1. Mots-clés EXACT (5-7 mots-clés):
   - Mots-clés principaux avec volume de recherche élevé
   - Format: "mot-clé exact"

2. Mots-clés PHRASE (5-7 mots-clés):
   - Mots-clés long-tail avec bonne conversion
   - Format: "mot clé phrase"

3. Mots-clés BROAD (5-6 mots-clés):
   - Mots-clés de découverte avec volume modéré
   - Format: mot clé broad

4. Suggestions d'optimisation (3-5 conseils):
   - Stratégies pour améliorer les performances

Retourne uniquement la liste formatée, sans explications supplémentaires.
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en marketing digital et Google Ads. Réponds de manière concise et pratique."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const response = completion.choices[0]?.message?.content || ''
      
      // Parser la réponse
      const lines = response.split('\n').filter(line => line.trim())
      const keywords: string[] = []
      const suggestions: string[] = []
      
      let currentSection = ''
      
      for (const line of lines) {
        if (line.includes('EXACT') || line.includes('PHRASE') || line.includes('BROAD')) {
          currentSection = line
        } else if (line.includes('Suggestions') || line.includes('optimisation')) {
          currentSection = 'suggestions'
        } else if (line.trim() && !line.startsWith('-') && !line.startsWith('•')) {
          if (currentSection === 'suggestions') {
            suggestions.push(line.trim())
          } else {
            keywords.push(line.trim())
          }
        }
      }

      return {
        content: keywords,
        suggestions,
        confidence: 0.85
      }

    } catch (error) {
      console.error('Erreur génération mots-clés OpenAI:', error)
      console.log('⚠️ Fallback vers les données simulées')
      return this.getSimulatedKeywords(request)
    }
  }

  // 📝 GÉNÉRATION DE HEADLINES
  async generateHeadlines(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // Vérifier si OpenAI est disponible
      if (!openai) {
        console.log('⚠️ OpenAI non configuré, utilisation des données simulées')
        return this.getSimulatedHeadlines(request)
      }

      const prompt = `
Tu es un expert en copywriting pour Google Ads.

Contexte:
- Industrie: ${request.industry}
- Site web: ${request.website}
- Objectifs: ${request.goals.join(', ')}

Génère 8-10 headlines d'annonces Google Ads optimisées qui respectent:
- Maximum 30 caractères par headline
- Incluent des mots-clés pertinents
- Créent de l'urgence ou de la valeur
- Utilisent des chiffres et des preuves sociales

Format de réponse:
- Une headline par ligne
- Pas de numérotation
- Pas d'explications

Exemple de style:
"Agence Marketing | +200% ROI"
"Conseil Expert | Gratuit 30min"
"Optimisation Conversion | Résultats"
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un expert copywriter spécialisé dans les annonces Google Ads. Crée des headlines percutantes et optimisées."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })

      const response = completion.choices[0]?.message?.content || ''
      const headlines = response.split('\n').filter(line => line.trim())

      return {
        content: headlines,
        suggestions: [
          'Testez différentes combinaisons de headlines',
          'Utilisez des extensions d\'annonces pour plus d\'informations',
          'A/B testez les headlines les plus performantes'
        ],
        confidence: 0.9
      }

    } catch (error) {
      console.error('Erreur génération headlines OpenAI:', error)
      console.log('⚠️ Fallback vers les données simulées')
      return this.getSimulatedHeadlines(request)
    }
  }

  // 📄 GÉNÉRATION DE DESCRIPTIONS
  async generateDescriptions(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // Vérifier si OpenAI est disponible
      if (!openai) {
        console.log('⚠️ OpenAI non configuré, utilisation des données simulées')
        return this.getSimulatedDescriptions(request)
      }

      const prompt = `
Tu es un expert en copywriting pour Google Ads.

Contexte:
- Industrie: ${request.industry}
- Site web: ${request.website}
- Objectifs: ${request.goals.join(', ')}

Génère 4-5 descriptions d'annonces Google Ads optimisées qui respectent:
- Maximum 90 caractères par description
- Incluent un appel à l'action clair
- Mettent en avant les bénéfices
- Utilisent des preuves sociales ou des garanties

Format de réponse:
- Une description par ligne
- Pas de numérotation
- Pas d'explications

Exemple de style:
"Agence marketing digitale spécialisée dans l'optimisation des conversions. Résultats garantis ou remboursé. Consultation gratuite."
"Stratégie marketing personnalisée pour votre entreprise. Augmentation moyenne du ROI de 200%. Devis gratuit."
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un expert copywriter spécialisé dans les descriptions d'annonces Google Ads. Crée des descriptions persuasives et optimisées."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })

      const response = completion.choices[0]?.message?.content || ''
      const descriptions = response.split('\n').filter(line => line.trim())

      return {
        content: descriptions,
        suggestions: [
          'Incluez toujours un appel à l\'action',
          'Utilisez des chiffres et des preuves sociales',
          'Testez différentes longueurs de descriptions'
        ],
        confidence: 0.9
      }

    } catch (error) {
      console.error('Erreur génération descriptions OpenAI:', error)
      console.log('⚠️ Fallback vers les données simulées')
      return this.getSimulatedDescriptions(request)
    }
  }

  // ⚡ GÉNÉRATION DE SUGGESTIONS D'OPTIMISATION
  async generateOptimizationSuggestions(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // Vérifier si OpenAI est disponible
      if (!openai) {
        console.log('⚠️ OpenAI non configuré, utilisation des données simulées')
        return this.getSimulatedOptimizationSuggestions(request)
      }

      const prompt = `
Tu es un expert en optimisation Google Ads.

Contexte:
- Industrie: ${request.industry}
- Site web: ${request.website}
- Objectifs: ${request.goals.join(', ')}
- Budget: ${request.budget || 'Non spécifié'}€/jour
- Contexte supplémentaire: ${request.context || 'Aucun'}

Génère 5-7 suggestions d'optimisation spécifiques et actionnables pour améliorer les performances des campagnes Google Ads.

Les suggestions doivent inclure:
- Optimisation des mots-clés
- Amélioration des annonces
- Gestion du budget
- Ciblage et audiences
- Tests A/B

Format de réponse:
- Une suggestion par ligne
- Commence par un verbe d'action
- Sois spécifique et mesurable
- Pas de numérotation

Exemple de style:
"Pausez les mots-clés avec un CTR < 1% depuis 14 jours"
"Augmentez les enchères de 20% sur les mots-clés avec un ROAS > 3"
"Créez 3 nouvelles annonces par groupe d'annonces"
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en optimisation Google Ads. Donne des conseils pratiques et actionnables."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })

      const response = completion.choices[0]?.message?.content || ''
      const suggestions = response.split('\n').filter(line => line.trim())

      return {
        content: suggestions,
        suggestions: [
          'Priorisez les optimisations par impact potentiel',
          'Testez les changements sur de petits volumes d\'abord',
          'Surveillez les performances après chaque optimisation'
        ],
        confidence: 0.8
      }

    } catch (error) {
      console.error('Erreur génération suggestions OpenAI:', error)
      console.log('⚠️ Fallback vers les données simulées')
      return this.getSimulatedOptimizationSuggestions(request)
    }
  }

  // 🎯 ANALYSE DE PERFORMANCE
  async analyzePerformance(metrics: any): Promise<AIGenerationResponse> {
    try {
      // Vérifier si OpenAI est disponible
      if (!openai) {
        console.log('⚠️ OpenAI non configuré, utilisation des données simulées')
        return this.getSimulatedPerformanceAnalysis(metrics)
      }

      const prompt = `
Tu es un expert en analyse de performance Google Ads.

Métriques actuelles:
- CTR: ${metrics.ctr}%
- CPC: €${metrics.cpc}
- ROAS: ${metrics.roas}x
- Conversions: ${metrics.conversions}
- Coût: €${metrics.cost}

Analyse ces performances et génère:
1. 3-5 problèmes identifiés
2. 3-5 solutions d'amélioration
3. 2-3 opportunités d'optimisation

Format de réponse:
- Problèmes: "Problème: [description]"
- Solutions: "Solution: [action concrète]"
- Opportunités: "Opportunité: [suggestion]"
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en analyse de performance Google Ads. Analyse les données et propose des améliorations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 600
      })

      const response = completion.choices[0]?.message?.content || ''
      const analysis = response.split('\n').filter(line => line.trim())

      return {
        content: analysis,
        suggestions: [
          'Surveillez ces métriques régulièrement',
          'Implémentez les solutions par ordre de priorité',
          'Mesurez l\'impact de chaque changement'
        ],
        confidence: 0.85
      }

    } catch (error) {
      console.error('Erreur analyse performance OpenAI:', error)
      console.log('⚠️ Fallback vers les données simulées')
      return this.getSimulatedPerformanceAnalysis(metrics)
    }
  }

  // 🎯 MÉTHODES DE FALLBACK (données simulées)
  private getSimulatedKeywords(request: AIGenerationRequest): AIGenerationResponse {
    const keywords = [
      `${request.industry} expert`,
      `${request.industry} professionnel`,
      `${request.industry} spécialiste`,
      `${request.industry} conseil`,
      `${request.industry} service`,
      `meilleur ${request.industry}`,
      `${request.industry} pas cher`,
      `${request.industry} prix`,
      `${request.industry} avis`,
      `${request.industry} recommandé`
    ]

    const suggestions = [
      'Cibler les mots-clés long-tail pour réduire les coûts',
      'Utiliser des extensions d\'annonces pour améliorer le CTR',
      'Créer des landing pages dédiées pour chaque groupe d\'annonces'
    ]

    return {
      content: keywords,
      suggestions,
      confidence: 0.6
    }
  }

  private getSimulatedHeadlines(request: AIGenerationRequest): AIGenerationResponse {
    const headlines = [
      `${request.industry} Expert | Résultats Garantis`,
      `Conseil ${request.industry} | +200% ROI`,
      `${request.industry} Spécialiste | Gratuit 30min`,
      `Optimisation ${request.industry} | Résultats Immédiats`,
      `${request.industry} Professionnel | Devis Gratuit`
    ]

    return {
      content: headlines,
      suggestions: [
        'Testez différentes combinaisons de headlines',
        'Utilisez des extensions d\'annonces pour plus d\'informations'
      ],
      confidence: 0.7
    }
  }

  private getSimulatedDescriptions(request: AIGenerationRequest): AIGenerationResponse {
    const descriptions = [
      `${request.industry} spécialisé dans l'optimisation des performances. Résultats garantis ou remboursé. Consultation gratuite.`,
      `Stratégie ${request.industry} personnalisée pour votre entreprise. Augmentation moyenne du ROI de 200%. Devis gratuit.`
    ]

    return {
      content: descriptions,
      suggestions: [
        'Incluez toujours un appel à l\'action',
        'Utilisez des chiffres et des preuves sociales'
      ],
      confidence: 0.7
    }
  }

  private getSimulatedOptimizationSuggestions(request: AIGenerationRequest): AIGenerationResponse {
    const suggestions = [
      'Pausez les mots-clés avec un CTR < 1% depuis 14 jours',
      'Augmentez les enchères de 20% sur les mots-clés avec un ROAS > 3',
      'Créez 3 nouvelles annonces par groupe d\'annonces',
      'Optimisez les heures de diffusion selon les performances',
      'Ajoutez des extensions d\'annonces pour améliorer le CTR'
    ]

    return {
      content: suggestions,
      suggestions: [
        'Priorisez les optimisations par impact potentiel',
        'Testez les changements sur de petits volumes d\'abord'
      ],
      confidence: 0.6
    }
  }

  private getSimulatedPerformanceAnalysis(metrics: any): AIGenerationResponse {
    const analysis = [
      'Problème: CTR faible (2.5%) - en dessous de la moyenne du secteur',
      'Problème: ROAS de 2.2x - objectif non atteint',
      'Solution: Optimiser les annonces pour améliorer le CTR',
      'Solution: Ajuster les enchères sur les mots-clés performants',
      'Opportunité: Tester de nouveaux mots-clés long-tail'
    ]

    return {
      content: analysis,
      suggestions: [
        'Surveillez ces métriques régulièrement',
        'Implémentez les solutions par ordre de priorité'
      ],
      confidence: 0.6
    }
  }

  /**
   * Génère des recommandations d'optimisation
   */
  async generateRecommendations(request: {
    prompt: string
    campaignType: string
    performanceData: any
  }): Promise<{ recommendations: any[] }> {
    try {
      if (!openai) {
        console.log('⚠️ OpenAI non configuré, utilisation des recommandations simulées')
        return { recommendations: [] }
      }

      const enhancedPrompt = `
${request.prompt}

Analyse ces données de performance et génère des recommandations d'optimisation spécifiques et actionnables.

Retourne la réponse au format JSON strict :
{
  "recommendations": [
    {
      "id": "unique-id",
      "type": "BUDGET|BID|KEYWORD|TARGETING|CREATIVE",
      "priority": "HIGH|MEDIUM|LOW",
      "title": "Titre de la recommandation",
      "description": "Description détaillée",
      "impact": "POSITIVE|NEGATIVE|NEUTRAL",
      "estimatedImprovement": 15,
      "action": "Action spécifique à effectuer",
      "applied": false
    }
  ]
}

Assure-toi que la réponse est un JSON valide et parsable.
`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en optimisation Google Ads. Réponds uniquement en JSON valide."
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      })

      const response = completion.choices[0]?.message?.content
      
      if (!response) {
        console.log('⚠️ Réponse OpenAI vide')
        return { recommendations: [] }
      }

      try {
        // Essayer de parser la réponse JSON
        const parsedResponse = JSON.parse(response)
        
        if (parsedResponse.recommendations && Array.isArray(parsedResponse.recommendations)) {
          console.log('✅ Recommandations générées avec succès:', parsedResponse.recommendations.length)
          return parsedResponse
        } else {
          console.log('⚠️ Format de réponse invalide')
          return { recommendations: [] }
        }
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON OpenAI:', parseError)
        console.log('Réponse brute:', response)
        return { recommendations: [] }
      }
    } catch (error) {
      console.error('Erreur génération recommandations OpenAI:', error)
      return { recommendations: [] }
    }
  }

  /**
   * Génère un benchmark pour un secteur
   */
  async generateBenchmark(request: {
    industry: string
    campaignType: string
    prompt: string
  }): Promise<any> {
    try {
      if (!openai) {
        console.log('⚠️ OpenAI non configuré, utilisation du benchmark simulé')
        return {}
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: request.prompt }],
        max_tokens: 800,
        temperature: 0.2,
      })

      const response = completion.choices[0]?.message?.content
      
      // TODO: Parser la réponse JSON structurée
      return {}
    } catch (error) {
      console.error('Erreur génération benchmark OpenAI:', error)
      return {}
    }
  }
}

export const openaiService = new OpenAIService() 