import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { openAIService } from "@/lib/openai-service"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { campaignId, optimizationType } = await request.json()

    if (!campaignId) {
      return NextResponse.json(
        { error: "ID de campagne manquant" },
        { status: 400 }
      )
    }

    console.log("🤖 Optimisation automatique:", {
      userId: session.user.id,
      campaignId,
      optimizationType
    })

    // Récupérer les données de la campagne (simulation)
    const campaignData = {
      industry: "Marketing Digital",
      website: "https://example.com",
      goals: ["Leads", "Conversions"],
      budget: 100,
      context: `Campagne ID: ${campaignId}, Type: ${optimizationType}`
    }

    // Récupérer les métriques de performance (simulation)
    const performanceMetrics = {
      ctr: 2.5,
      cpc: 1.8,
      roas: 2.2,
      conversions: 15,
      cost: 850
    }

    // Générer les suggestions d'optimisation avec l'IA
    const optimizationResponse = await openAIService.generateOptimizationSuggestions(campaignData)
    
    // Analyser les performances avec l'IA
    const performanceAnalysis = await openAIService.analyzePerformance(performanceMetrics)

    // Créer un rapport d'optimisation
    const optimizationReport = {
      campaignId,
      timestamp: new Date(),
      suggestions: optimizationResponse.content,
      performanceAnalysis: performanceAnalysis.content,
      estimatedImprovement: Math.round(
        optimizationResponse.content.length * 5 + performanceAnalysis.content.length * 3
      ),
      confidence: optimizationResponse.confidence
    }

    // Sauvegarder le rapport d'optimisation (optionnel)
    // await prisma.optimizationReport.create({
    //   data: {
    //     userId: session.user.id,
    //     campaignId,
    //     report: JSON.stringify(optimizationReport),
    //     status: 'GENERATED'
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: optimizationReport,
      message: "Rapport d'optimisation généré avec succès"
    })

  } catch (error) {
    console.error("❌ Erreur optimisation automatique:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de l'optimisation automatique",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
}

// GET - Récupérer l'historique des optimisations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    // Récupérer l'historique des optimisations (simulation)
    const optimizationHistory = [
      {
        id: '1',
        campaignId: campaignId || '1',
        timestamp: new Date(Date.now() - 86400000), // Hier
        type: 'AUTO_OPTIMIZATION',
        suggestions: [
          'Augmenter les enchères de 15% sur les mots-clés performants',
          'Pauser les mots-clés avec un CTR < 1%',
          'Créer de nouvelles annonces pour améliorer le CTR'
        ],
        impact: '+12%',
        status: 'APPLIED'
      },
      {
        id: '2',
        campaignId: campaignId || '1',
        timestamp: new Date(Date.now() - 172800000), // Avant-hier
        type: 'MANUAL_OPTIMIZATION',
        suggestions: [
          'Ajustement du budget vers les meilleurs groupes d\'annonces',
          'Optimisation des heures de diffusion'
        ],
        impact: '+8%',
        status: 'APPLIED'
      }
    ]

    return NextResponse.json({
      success: true,
      data: optimizationHistory,
      message: "Historique des optimisations récupéré"
    })

  } catch (error) {
    console.error("❌ Erreur récupération historique:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    )
  }
} 