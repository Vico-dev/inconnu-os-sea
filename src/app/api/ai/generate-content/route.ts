import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { openaiService, AIGenerationRequest } from "@/lib/openai-service"

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

    const body: AIGenerationRequest = await request.json()

    // Validation des données
    if (!body.type || !body.industry || !body.website || !body.goals) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      )
    }

    console.log("🤖 Génération de contenu IA:", {
      userId: session.user.id,
      type: body.type,
      industry: body.industry
    })

    let response

    // Générer le contenu selon le type demandé
    switch (body.type) {
      case 'keywords':
        response = await openaiService.generateKeywords(body)
        break
        
      case 'headlines':
        response = await openaiService.generateHeadlines(body)
        break
        
      case 'descriptions':
        response = await openaiService.generateDescriptions(body)
        break
        
      case 'optimization':
        response = await openaiService.generateOptimizationSuggestions(body)
        break
        
      default:
        return NextResponse.json(
          { error: "Type de génération non supporté" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: `Contenu ${body.type} généré avec succès`
    })

  } catch (error) {
    console.error("❌ Erreur génération contenu IA:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de la génération du contenu",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
} 