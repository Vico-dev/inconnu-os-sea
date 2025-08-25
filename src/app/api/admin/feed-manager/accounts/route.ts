import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { gmcService } from '@/lib/gmc-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est Admin ou AM
    if (session.user.role !== 'ADMIN' && session.user.role !== 'ACCOUNT_MANAGER') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    console.log('🔄 Récupération des comptes GMC...')
    
    const accounts = await gmcService.getAccounts()
    
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('❌ Erreur récupération comptes GMC:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des comptes GMC' },
      { status: 500 }
    )
  }
} 