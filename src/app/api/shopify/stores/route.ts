import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShopifyGraphQLService } from '@/lib/shopify-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const stores = await ShopifyGraphQLService.getUserStores(session.user.id)

    return NextResponse.json({
      success: true,
      stores
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des stores Shopify:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { storeId } = body

    if (!storeId) {
      return NextResponse.json(
        { error: "ID du store requis" },
        { status: 400 }
      )
    }

    await ShopifyGraphQLService.removeStore(storeId, session.user.id)

    return NextResponse.json({
      success: true,
      message: "Store supprimé avec succès"
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du store Shopify:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 