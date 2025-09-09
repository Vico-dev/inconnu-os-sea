import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShopifyGraphQLService } from '@/lib/shopify-graphql-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const storeId = searchParams.get('storeId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!storeId) {
      return NextResponse.json(
        { error: "ID du store requis" },
        { status: 400 }
      )
    }

    // Récupérer le store pour obtenir les informations de connexion
    const stores = await ShopifyGraphQLService.getUserStores(session.user.id)
    const store = stores.find((s: any) => s.id === storeId)

    if (!store) {
      return NextResponse.json(
        { error: "Store non trouvé" },
        { status: 404 }
      )
    }

    // Récupérer les produits
    const products = await ShopifyGraphQLService.getProducts(store.domain, store.accessToken, limit)

    // Calculer les stats de recrutement (first-order) sur une fenêtre de 90 jours
    let recruitmentByProduct: Record<string, any> = {}
    try {
      const recruitment = await ShopifyGraphQLService.computeRecruitmentStats(store.domain, store.accessToken, 90)
      recruitmentByProduct = (recruitment.stats || []).reduce((acc: any, s: any) => {
        acc[String(s.productId)] = s
        return acc
      }, {})
    } catch (e) {
      console.warn('Impossible de calculer les stats de recrutement:', e)
    }

    // Optimiser les produits pour GMC + injection des sous-scores (recrutement)
    const optimizedProducts = products.map((product: any) => {
      const optimized = ShopifyGraphQLService.optimizeProductForGMC(product)
      const pid = product.id?.toString()
      const rec = pid ? recruitmentByProduct[pid] : null
      if (rec && optimized.ai_analysis?.subscores) {
        // weighted_norm est 0..2 → convertir en 0..25
        const recruitmentScore = Math.max(0, Math.min(25, Math.round((rec.weighted_norm || 0) * 12.5)))
        optimized.ai_analysis.subscores.recruitment = recruitmentScore
        optimized.ai_analysis.recruitment_metrics = rec
      }
      return optimized
    })

    return NextResponse.json({
      success: true,
      products: optimizedProducts,
      total: products.length,
      store: {
        id: store.id,
        name: store.name,
        domain: store.domain,
        currency: store.currency
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des produits Shopify:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 