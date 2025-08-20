import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { NotificationService } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  try {
    // Vérifier la clé API pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('📊 Début génération rapports hebdomadaires')

    // Récupérer tous les comptes clients actifs
    const clientAccounts = await prisma.clientAccount.findMany({
      where: {
        status: 'ACTIVE',
        subscription: {
          status: 'ACTIVE'
        }
      },
      include: {
        user: true,
        company: true,
        campaigns: true
      }
    })

    console.log(`📈 Génération de ${clientAccounts.length} rapports hebdomadaires`)

    let successCount = 0
    let errorCount = 0

    for (const clientAccount of clientAccounts) {
      try {
        // Générer le rapport hebdomadaire
        await NotificationService.generateWeeklyReport(clientAccount.id)
        
        // Créer une notification de rapport généré
        await NotificationService.createNotification({
          type: 'info',
          title: 'Rapport hebdomadaire disponible',
          message: 'Votre rapport hebdomadaire de performance Google Ads a été généré et envoyé par email.',
          clientAccountId: clientAccount.id,
          priority: 'low'
        })

        successCount++
        console.log(`✅ Rapport généré pour ${clientAccount.company.name}`)

      } catch (error) {
        errorCount++
        console.error(`❌ Erreur rapport pour ${clientAccount.company.name}:`, error)
      }
    }

    console.log(`📊 Rapports terminés: ${successCount} succès, ${errorCount} erreurs`)

    return NextResponse.json({
      success: true,
      message: `Rapports hebdomadaires générés: ${successCount} succès, ${errorCount} erreurs`,
      stats: {
        total: clientAccounts.length,
        success: successCount,
        error: errorCount
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur génération rapports:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la génération des rapports',
      details: error.message 
    }, { status: 500 })
  }
}

// Endpoint GET pour tester manuellement
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testMode = searchParams.get('test') === 'true'
    
    if (!testMode) {
      return NextResponse.json({ error: 'Mode test requis' }, { status: 400 })
    }

    console.log('🧪 Test génération rapport hebdomadaire')

    // Récupérer un seul compte client pour le test
    const clientAccount = await prisma.clientAccount.findFirst({
      where: {
        status: 'ACTIVE'
      },
      include: {
        user: true,
        company: true,
        campaigns: true
      }
    })

    if (!clientAccount) {
      return NextResponse.json({ error: 'Aucun compte client actif trouvé' }, { status: 404 })
    }

    // Générer le rapport de test
    await NotificationService.generateWeeklyReport(clientAccount.id)

    return NextResponse.json({
      success: true,
      message: 'Rapport de test généré avec succès',
      clientAccount: {
        id: clientAccount.id,
        company: clientAccount.company.name,
        user: clientAccount.user.email
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur test rapport:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du test de génération',
      details: error.message 
    }, { status: 500 })
  }
} 