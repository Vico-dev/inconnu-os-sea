import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { gmcService } from '@/lib/gmc-service'
import { productScoringService } from '@/lib/product-scoring-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { accountId, feedId } = body

    if (!accountId || !feedId) {
      return NextResponse.json(
        { error: 'accountId et feedId sont requis' },
        { status: 400 }
      )
    }

    console.log(`🔄 Optimisation du feed ${feedId} pour le compte ${accountId}`)

    // 1. Récupérer le feed depuis GMC
    const feed = await gmcService.getFeed(accountId, feedId)
    
    if (!feed.products || feed.products.length === 0) {
      return NextResponse.json(
        { error: 'Aucun produit trouvé dans ce feed' },
        { status: 404 }
      )
    }

    // 2. Optimiser les produits avec l'IA
    const optimizedProducts = await productScoringService.processProductBatch(feed.products)

    // 3. Mettre à jour le feed avec les custom labels optimisés
    const productsWithCustomLabels = optimizedProducts.map(optimized => ({
      ...feed.products.find(p => p.id === optimized.id)!,
      custom_labels: optimized.custom_labels
    }))

    await gmcService.updateFeed(accountId, feedId, productsWithCustomLabels)

    // 4. Calculer les statistiques
    const stats = {
      totalProducts: optimizedProducts.length,
      averageScore: (optimizedProducts.reduce((sum, p) => sum + p.score.overall, 0) / optimizedProducts.length).toFixed(1),
      highPerformance: optimizedProducts.filter(p => p.score.overall >= 80).length,
      mediumPerformance: optimizedProducts.filter(p => p.score.overall >= 60 && p.score.overall < 80).length,
      lowPerformance: optimizedProducts.filter(p => p.score.overall < 60).length,
      optimizationRate: ((optimizedProducts.filter(p => p.score.overall >= 60).length / optimizedProducts.length) * 100).toFixed(1)
    }

    return NextResponse.json({
      success: true,
      message: `Feed optimisé avec succès: ${optimizedProducts.length} produits traités`,
      stats,
      optimizedProducts: optimizedProducts.slice(0, 10) // Retourner les 10 premiers pour l'aperçu
    })

  } catch (error) {
    console.error('Erreur lors de l\'optimisation du feed:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'optimisation du feed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const feedId = searchParams.get('feedId')

    if (!accountId || !feedId) {
      return NextResponse.json(
        { error: 'accountId et feedId sont requis' },
        { status: 400 }
      )
    }

    // Récupérer le statut d'optimisation du feed
    const feed = await gmcService.getFeed(accountId, feedId)
    
    const optimizationStatus = {
      feedId,
      accountId,
      totalProducts: feed.products.length,
      lastOptimized: feed.last_updated,
      status: feed.status,
      hasCustomLabels: feed.products.some(p => 
        p.custom_labels?.custom_label_0 || 
        p.custom_labels?.custom_label_1
      )
    }

    return NextResponse.json({
      success: true,
      optimizationStatus
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du statut d\'optimisation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    )
  }
} 