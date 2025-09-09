import { NextRequest, NextResponse } from 'next/server';
import { openAIService, AIGenerationRequest } from '@/lib/openai-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, gtin, targetType, currentTitle, currentDescription, currentPrice, category, brand, clientContext } = body;

    // Validation des paramètres
    if (!productId || !gtin || !targetType) {
      return NextResponse.json({ 
        error: 'Paramètres manquants: productId, gtin, targetType requis' 
      }, { status: 400 });
    }

    if (!['title', 'description', 'price'].includes(targetType)) {
      return NextResponse.json({ 
        error: 'targetType invalide. Doit être: title, description, ou price' 
      }, { status: 400 });
    }

    // Préparer la requête IA
    const aiRequest: AIGenerationRequest = {
      productId,
      gtin,
      currentTitle,
      currentDescription,
      currentPrice,
      category,
      brand,
      targetType,
      clientContext
    };

    // Appeler le service OpenAI
    const result = await openAIService.generateContent(aiRequest);

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Erreur lors de la génération IA' 
      }, { status: 500 });
    }

    // Retourner le résultat
    return NextResponse.json({
      success: true,
      data: {
        content: result.content,
        price: result.price,
        usage: result.usage
      }
    });

  } catch (error) {
    console.error('Erreur API génération IA:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

// Endpoint pour la génération en lot
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { requests } = body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json({ 
        error: 'Paramètre "requests" requis et doit être un tableau non vide' 
      }, { status: 400 });
    }

    if (requests.length > 10) {
      return NextResponse.json({ 
        error: 'Maximum 10 requêtes simultanées autorisées' 
      }, { status: 400 });
    }

    // Valider chaque requête
    for (const req of requests) {
      if (!req.productId || !req.gtin || !req.targetType) {
        return NextResponse.json({ 
          error: 'Chaque requête doit contenir: productId, gtin, targetType' 
        }, { status: 400 });
      }
    }

    // Appeler le service OpenAI en lot
    const results = await openAIService.generateBatch(requests);

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Erreur API génération IA en lot:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
} 