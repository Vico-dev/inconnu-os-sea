import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkExpiredMandates } from '@/lib/cron/mandate-reminder'

// Endpoint pour déclencher manuellement la vérification des mandats (admin uniquement)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('🔧 Déclenchement manuel de la vérification des mandats par:', session.user.email)
    
    const result = await checkExpiredMandates()

    return NextResponse.json({
      success: true,
      data: result,
      message: `Vérification terminée: ${result.processed?.expiring || 0} mandats expirant bientôt, ${result.processed?.expired || 0} mandats expirés`
    })

  } catch (error) {
    console.error('❌ Erreur lors de la vérification manuelle des mandats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des mandats' },
      { status: 500 }
    )
  }
}