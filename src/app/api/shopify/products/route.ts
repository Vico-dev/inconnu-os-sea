import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShopifyService } from '@/lib/shopify-service'

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
    const stores = await ShopifyService.getUserStores(session.user.id)
    const store = stores.find(s => s.id === storeId)

    if (!store) {
      return NextResponse.json(
        { error: "Store non trouvé" },
        { status: 404 }
      )
    }

    // Récupérer les produits
    const products = await ShopifyService.getProducts(store.domain, store.accessToken, limit)

    // Optimiser les produits pour GMC
    const optimizedProducts = products.map(product => ShopifyService.optimizeProductForGMC(product))

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