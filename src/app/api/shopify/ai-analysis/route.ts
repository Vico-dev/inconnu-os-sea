import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShopifyGraphQLService } from '@/lib/shopify-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const { productId, storeId, analysisType } = await request.json()

    if (!productId || !storeId) {
      return NextResponse.json(
        { error: "ID du produit et du store requis" },
        { status: 400 }
      )
    }

    // Récupérer le store
    const stores = await ShopifyGraphQLService.getUserStores(session.user.id)
    const store = stores.find(s => s.id === storeId)

    if (!store) {
      return NextResponse.json(
        { error: "Store non trouvé" },
        { status: 404 }
      )
    }

    // Récupérer le produit spécifique
    const products = await ShopifyGraphQLService.getProducts(store.domain, store.accessToken, 1000)
    const product = products.find(p => p.id.toString() === productId)

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      )
    }

    // Optimiser le produit avec toutes les analyses IA
    const optimizedProduct = ShopifyGraphQLService.optimizeProductForGMC(product)

    // Retourner l'analyse selon le type demandé
    switch (analysisType) {
      case 'content':
        return NextResponse.json({
          success: true,
          analysis: optimizedProduct.ai_analysis.content_analysis,
          title_variants: optimizedProduct.ai_analysis.title_variants,
          description_variants: optimizedProduct.ai_analysis.description_variants
        })

      case 'performance':
        return NextResponse.json({
          success: true,
          score: optimizedProduct.ai_analysis.score,
          recommendations: optimizedProduct.ai_analysis.recommendations,
          metrics: {
            image_count: optimizedProduct.ai_analysis.image_count,
            description_length: optimizedProduct.ai_analysis.description_length,
            tags_count: optimizedProduct.ai_analysis.tags_count,
            collections_count: optimizedProduct.ai_analysis.collections_count,
            variants_count: optimizedProduct.ai_analysis.variants_count,
            has_stock: optimizedProduct.ai_analysis.has_stock,
            price_valid: optimizedProduct.ai_analysis.price_valid
          }
        })

      case 'ab_testing':
        return NextResponse.json({
          success: true,
          title_variants: optimizedProduct.ai_analysis.title_variants,
          description_variants: optimizedProduct.ai_analysis.description_variants,
          current_content: {
            title: product.title,
            description: product.description
          }
        })

      default:
        return NextResponse.json({
          success: true,
          product: optimizedProduct
        })
    }

  } catch (error) {
    console.error('Erreur lors de l\'analyse IA:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 