import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShopifyService } from '@/lib/shopify-service'

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
        { error: "Nom du shop requis" },
        { status: 400 }
      )
    }

    // Nettoyer le nom du shop
    const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '')
    
    // Générer l'URL d'autorisation
    const authUrl = ShopifyService.getAuthUrl(cleanShop)

    return NextResponse.json({
      success: true,
      authUrl
    })

  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'auth Shopify:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 