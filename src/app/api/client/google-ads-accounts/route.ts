import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleAdsAccountsService } from '@/lib/google-ads-accounts-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const accounts = await GoogleAdsAccountsService.getUserAccounts(session.user.id)
    const stats = await GoogleAdsAccountsService.getAccountsStats(session.user.id)

    return NextResponse.json({
      success: true,
      accounts,
      stats
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des comptes Google Ads:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 