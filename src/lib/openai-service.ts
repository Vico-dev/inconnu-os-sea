import OpenAI from 'openai';

export interface AIGenerationRequest {
  productId: string;
  gtin: string;
  currentTitle?: string;
  currentDescription?: string;
  currentPrice?: number;
  category?: string;
  brand?: string;
  targetType: 'title' | 'description' | 'price';
  clientContext?: string;
}

export interface AIGenerationResult {
  success: boolean;
  content?: string;
  price?: number;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    // Ne pas initialiser le client au constructeur
  }

  private async getClient(): Promise<OpenAI> {
    if (this.client) {
      return this.client;
    }

    const apiKey = process.env.OPENAI_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_KEY environment variable is required');
    }

    this.client = new OpenAI({
      apiKey,
      maxRetries: 3,
    });

    return this.client;
  }

  async generateContent(request: AIGenerationRequest): Promise<AIGenerationResult> {
    try {
      const client = await this.getClient();
      const prompt = this.buildPrompt(request);
      
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.targetType)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.getMaxTokens(request.targetType),
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated');
      }

      // Traitement spécifique selon le type
      if (request.targetType === 'price') {
        const price = this.extractPrice(content);
        return {
          success: true,
          price,
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          }
        };
      }

      return {
        success: true,
        content: content.trim(),
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        }
      };

    } catch (error) {
      console.error('OpenAI API error:', error);

      // Fallback local si quota (429) ou indispo
      const message = error instanceof Error ? error.message : 'Unknown error'
      const isQuota = message.includes('429') || message.toLowerCase().includes('quota') || message.includes('insufficient_quota')

      if (isQuota) {
        console.log('⚠️ Quota OpenAI dépassé, utilisation du fallback local')
        // Heuristiques rapides et propres
        if (request.targetType === 'title') {
          const base = (request.currentTitle || 'Produit').trim()
          const brand = (request.brand || '').trim()
          const category = (request.category || '').trim()
          const title = [brand, base, category].filter(Boolean).join(' ').slice(0, 140)
          return { success: true, content: title }
        }
        if (request.targetType === 'description') {
          const title = request.currentTitle || 'Ce produit'
          const brand = request.brand || ''
          const category = request.category || ''
          const desc = `${title}${brand ? ` - ${brand}` : ''}${category ? ` (${category})` : ''}

Caractéristiques principales :
• Qualité premium et durabilité
• Design moderne et fonctionnel  
• Livraison rapide et sécurisée
• Garantie satisfait ou remboursé
• Support client réactif

Idéal pour un usage quotidien, ce produit allie performance et esthétique.`
          return { success: true, content: desc }
        }
        if (request.targetType === 'price') {
          const base = typeof request.currentPrice === 'number' ? request.currentPrice : 0
          const member = Math.max(0, +(base * 0.9).toFixed(2))
          return { success: true, price: member }
        }
      }

      return { success: false, error: message };
    }
  }

  private buildPrompt(request: AIGenerationRequest): string {
    const baseInfo = `
Produit: ${request.currentTitle || 'Nouveau produit'}
GTIN: ${request.gtin}
Catégorie: ${request.category || 'Non spécifiée'}
Marque: ${request.brand || 'Non spécifiée'}
${request.clientContext ? `Contexte client: ${request.clientContext}` : ''}
`;

    switch (request.targetType) {
      case 'title':
        return `${baseInfo}
Génère un titre Google Shopping conforme et performant qui:
- Fait entre 65 et 140 caractères (jamais > 150)
- Suit l'ordre: Marque + Type de produit + attributs clés (taille/couleur/matière/capacité) + modèle/référence si pertinent
- Intègre naturellement les mots-clés recherchés (sans bourrage)
- Est factuel, clair, en français, sans promo ni clickbait
- Interdits: ALL CAPS, emojis, coordonnées, superlatifs non prouvés

Titre actuel: "${request.currentTitle || 'Aucun'}"

Sors uniquement le titre final, sans guillemets ni explications.`;

      case 'description':
        return `${baseInfo}
Rédige une description Google Shopping conforme et convaincante qui:
- Fait entre 700 et 1100 caractères
- Structure: 1) accroche factuelle courte; 2) puces avec bénéfices/usage; 3) spécifications clés (marque, modèle/référence si dispo, matière, dimensions/taille/capacité, compatibilités, contenu du colis, entretien si pertinent); 4) rassurance factuelle (garantie, conformité, retours/livraison si connu)
- Intègre des mots-clés naturels, sans bourrage
- Interdits: claims non vérifiables, superlatifs non prouvés, clickbait, répétition inutile du titre, HTML, emojis, ALL CAPS, coordonnées, promotions
- Langue: français, ton précis et informatif

Description actuelle: "${request.currentDescription || 'Aucune'}"

Sors uniquement le texte final, sans guillemets ni explications.`;

      case 'price':
        return `${baseInfo}
Prix actuel: ${request.currentPrice ? `${request.currentPrice}€` : 'Non défini'}

Analyse le produit et suggère un prix public et un prix membre optimisés:
- Prix public: prix de vente standard
- Prix membre: prix réduit pour les clients fidèles (réduction de 10-25%)

Réponds uniquement au format: "Prix public: X.XX€, Prix membre: Y.YY€"`;

      default:
        throw new Error(`Type de génération non supporté: ${request.targetType}`);
    }
  }

  private getSystemPrompt(targetType: string): string {
    switch (targetType) {
      case 'title':
        return `Tu es expert Google Merchant Center et SEO. Tu écris des titres conformes aux politiques Google Shopping: exacts, utiles, sans promo ni claims non prouvés, sans ALL CAPS/emoji. Priorité: clarté, pertinence, mots-clés naturels.`;
      
      case 'description':
        return `Tu es expert Google Merchant Center. Tu rédiges des descriptions conformes aux politiques Shopping: exactes, utiles, sans exagération ni promesses non fondées, sans HTML/emoji/ALL CAPS, sans coordonnées ni promotions. Style clair, français natif, orienté bénéfices + preuves.`;
      
      case 'price':
        return `Tu es un expert en pricing et stratégie commerciale. Tu analyses les produits et suggères des prix optimaux basés sur la valeur perçue et la concurrence.`;
      
      default:
        return `Tu es un assistant IA spécialisé dans l'optimisation de contenu e-commerce.`;
    }
  }

  private getMaxTokens(targetType: string): number {
    switch (targetType) {
      case 'title': return 80;
      case 'description': return 500;
      case 'price': return 150;
      default: return 200;
    }
  }

  private extractPrice(content: string): number {
    // Extraction du prix depuis la réponse IA
    const priceMatch = content.match(/(\d+[.,]\d{2})/);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(',', '.'));
    }
    
    // Fallback: extraction d'un nombre simple
    const numberMatch = content.match(/(\d+)/);
    if (numberMatch) {
      return parseFloat(numberMatch[1]);
    }
    
    throw new Error('Impossible d\'extraire un prix de la réponse IA');
  }

  // Méthode pour la génération en lot
  async generateBatch(requests: AIGenerationRequest[]): Promise<AIGenerationResult[]> {
    const results: AIGenerationResult[] = [];
    
    // Traitement séquentiel pour éviter les rate limits
    for (const request of requests) {
      try {
        const result = await this.generateContent(request);
        results.push(result);
        
        // Pause entre les requêtes pour respecter les rate limits
        if (requests.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  // Méthode pour les recommandations de scoring (utilisée par le feed manager)
  async generateRecommendations(request: {
    prompt: string;
    campaignType: string;
    performanceData: any[];
  }): Promise<{
    recommendations: Array<{
      title?: string;
      description?: string;
      content?: string;
    }>;
  }> {
    try {
      const client = await this.getClient();
      
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en analyse de produits e-commerce et optimisation pour Google Shopping. 
            Analyse les produits et fournis des recommandations détaillées pour améliorer leur performance.`
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated');
      }

      // Parser la réponse JSON si possible
      try {
        const parsed = JSON.parse(content);
        if (parsed.recommendations) {
          return { recommendations: parsed.recommendations };
        }
      } catch (parseError) {
        // Si ce n'est pas du JSON, créer des recommandations à partir du texte
      }

      // Fallback: créer des recommandations à partir du contenu
      const recommendations = content
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('{') && !line.startsWith('}'))
        .map(line => ({
          title: line.trim().substring(0, 100),
          description: line.trim(),
          content: line.trim()
        }))
        .slice(0, 5); // Limiter à 5 recommandations

      return { recommendations };

    } catch (error) {
      console.error('Erreur génération recommandations:', error);
      
      // Fallback en cas d'erreur
      return {
        recommendations: [
          {
            title: 'Optimisation recommandée',
            description: 'Améliorer la qualité du produit',
            content: 'Vérifier les images, optimiser le titre et la description'
          }
        ]
      };
    }
  }
}

// Instance singleton - ne s'initialise qu'au moment de l'utilisation
export const openAIService = new OpenAIService(); 