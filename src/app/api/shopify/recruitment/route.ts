import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShopifyGraphQLService } from '@/lib/shopify-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const storeId = searchParams.get('storeId')
    const windowDays = parseInt(searchParams.get('windowDays') || '90')

    if (!storeId) {
      return NextResponse.json({ error: 'ID du store requis' }, { status: 400 })
    }

    // Récupérer le store de l'utilisateur
    const stores = await ShopifyGraphQLService.getUserStores(session.user.id)
    const store = stores.find(s => s.id === storeId)
    if (!store) {
      return NextResponse.json({ error: 'Store non trouvé' }, { status: 404 })
    }

    const result = await ShopifyGraphQLService.computeRecruitmentStats(store.domain, store.accessToken, windowDays)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Erreur lors du calcul des stats de recrutement:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

