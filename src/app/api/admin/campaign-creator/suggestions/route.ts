import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { openaiService } from '@/lib/openai-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, objective, type, budget, targetAudience, keywords, locations, description } = body

    // Générer des suggestions IA basées sur les paramètres
    const prompt = `
En tant qu'expert Google Ads, génère des suggestions pour une campagne avec les paramètres suivants :

Nom: ${name}
Objectif: ${objective}
Type: ${type}
Budget quotidien: ${budget}€
Audience cible: ${targetAudience}
Mots-clés actuels: ${keywords.join(', ')}
Localisations: ${locations.join(', ')}
Description: ${description}

Génère :
1. 10 mots-clés pertinents supplémentaires
2. Un budget quotidien recommandé
3. 3 conseils de ciblage
4. 5 conseils d'optimisation

Réponds au format JSON :
{
  "keywords": ["mot-clé1", "mot-clé2", ...],
  "budgetRecommendation": 75,
  "targetingRecommendations": ["conseil1", "conseil2", "conseil3"],
  "optimizationTips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
}
`

    const suggestions = await openaiService.generateContent(prompt)
    
    // Parser la réponse JSON
    let parsedSuggestions
    try {
      parsedSuggestions = JSON.parse(suggestions)
    } catch (error) {
      // Fallback si l'IA ne retourne pas du JSON valide
      parsedSuggestions = {
        keywords: ['mot-clé générique 1', 'mot-clé générique 2', 'mot-clé générique 3'],
        budgetRecommendation: Math.max(budget * 1.2, 50),
        targetingRecommendations: [
          'Ciblez les audiences similaires pour étendre votre portée',
          'Utilisez le ciblage par centres d\'intérêt',
          'Testez différentes tranches d\'âge'
        ],
        optimizationTips: [
          'Commencez avec des enchères automatiques',
          'Surveillez les mots-clés à faible performance',
          'Testez différents textes d\'annonces',
          'Optimisez les heures de diffusion',
          'Analysez les performances par appareil'
        ]
      }
    }

    return NextResponse.json(parsedSuggestions)
  } catch (error) {
    console.error('Erreur lors de la génération des suggestions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération des suggestions' },
      { status: 500 }
    )
  }
} 