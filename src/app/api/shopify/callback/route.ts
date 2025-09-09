import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ShopifyGraphQLService } from '@/lib/shopify-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/feed-manager?error=unauthorized`
      )
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const shop = searchParams.get('shop')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/feed-manager?error=auth_failed`
      )
    }

    if (!code || !shop) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/feed-manager?error=missing_params`
      )
    }

    // Nettoyer le nom du shop
    const cleanShop = shop.replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '')

    try {
      // Échanger le code contre un token d'accès
      const tokenData = await ShopifyGraphQLService.exchangeCodeForToken(cleanShop, code)

      // Récupérer les informations du store
      const shopInfo = await ShopifyGraphQLService.getShopInfo(cleanShop, tokenData.accessToken)

      // Sauvegarder le store en base de données
      await ShopifyGraphQLService.saveStore(session.user.id, {
        ...shopInfo,
        accessToken: tokenData.accessToken,
      })

      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/feed-manager?success=connected&shop=${cleanShop}`
      )

    } catch (tokenError) {
      console.error('Erreur lors de l\'échange du token Shopify:', tokenError)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/feed-manager?error=token_exchange_failed`
      )
    }

  } catch (error) {
    console.error('Erreur lors du callback Shopify:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/client/feed-manager?error=callback_failed`
    )
  }
} 