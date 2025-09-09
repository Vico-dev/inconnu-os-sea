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

    const body = await request.json()
    const { shop } = body

    if (!shop) {
      return NextResponse.json(
        { error: "Nom de boutique requis" },
        { status: 400 }
      )
    }

    // Générer l'URL d'authentification Shopify
    const authUrl = ShopifyGraphQLService.getAuthUrl(shop)
    
    return NextResponse.json({
      success: true,
      authUrl
    })

  } catch (error) {
    console.error('Erreur lors de l\'authentification Shopify:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 