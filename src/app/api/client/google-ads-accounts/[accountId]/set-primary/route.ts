import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleAdsAccountsService } from '@/lib/google-ads-accounts-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const { accountId } = params

    await GoogleAdsAccountsService.setPrimaryAccount(session.user.id, accountId)

    return NextResponse.json({
      success: true,
      message: "Compte principal défini avec succès"
    })

  } catch (error) {
    console.error('Erreur lors de la définition du compte principal:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 