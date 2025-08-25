import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { gmcService } from '@/lib/gmc-service'
import { productScoringService } from '@/lib/product-scoring-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string; feedId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'ACCOUNT_MANAGER') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { accountId, feedId } = params
    
    console.log(`🔄 Récupération du feed ${feedId} depuis GMC...`)
    
    // Récupérer le feed depuis GMC
    const feed = await gmcService.getFeed(accountId, feedId)
    
    return NextResponse.json(feed)
  } catch (error) {
    console.error('❌ Erreur récupération feed:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du feed' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { accountId: string; feedId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'ACCOUNT_MANAGER') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { accountId, feedId } = params
    const body = await request.json()
    const { action } = body

    if (action === 'analyze') {
      console.log(`🤖 Analyse IA du feed ${feedId}...`)
      
      // Récupérer le feed
      const feed = await gmcService.getFeed(accountId, feedId)
      
      // Analyser les produits avec l'IA
      const optimizedProducts = await productScoringService.analyzeProducts(feed.products)
      
      // Obtenir les statistiques
      const stats = productScoringService.getScoringStats(optimizedProducts)
      
      return NextResponse.json({
        feed,
        optimizedProducts,
        stats
      })
    }

    if (action === 'update') {
      const { optimizedProducts } = body
      
      console.log(`🔄 Mise à jour du feed ${feedId} avec ${optimizedProducts.length} produits...`)
      
      // Mettre à jour le feed dans GMC
      await gmcService.updateFeed(accountId, feedId, optimizedProducts)
      
      return NextResponse.json({ 
        success: true, 
        message: `Feed mis à jour avec ${optimizedProducts.length} produits` 
      })
    }

    if (action === 'sync') {
      console.log(`🔄 Synchronisation du feed ${feedId}...`)
      
      // Synchroniser le feed
      await gmcService.syncFeed(accountId, feedId)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Synchronisation terminée' 
      })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('❌ Erreur traitement feed:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du feed' },
      { status: 500 }
    )
  }
} 