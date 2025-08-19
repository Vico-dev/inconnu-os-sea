import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EmailService } from '@/lib/email-service'

function generateSignatureCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test signature électronique - Début')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', session ? 'Trouvée' : 'Non trouvée')
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Non autorisé',
        session: null
      }, { status: 401 })
    }

    console.log('👤 Utilisateur:', session.user.email)

    // Vérifier si un mandat existe
    const mandate = await prisma.advertisingMandate.findFirst({
      where: {
        clientAccount: {
          userId: session.user.id
        }
      },
      include: {
        clientAccount: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📄 Mandat trouvé:', mandate ? mandate.mandateNumber : 'Aucun')

    if (!mandate) {
      return NextResponse.json({ 
        error: 'Aucun mandat trouvé',
        userId: session.user.id,
        userEmail: session.user.email
      }, { status: 404 })
    }

    // Tester l'envoi d'email
    const testCode = generateSignatureCode()
    console.log('🔐 Code de test généré:', testCode)

    try {
      console.log('📧 Test envoi email à:', mandate.clientAccount.user.email)
      await EmailService.sendSignatureCode(
        mandate.clientAccount.user.email,
        mandate.clientAccount.user.firstName,
        mandate.mandateNumber,
        testCode,
        new Date(Date.now() + 15 * 60 * 1000).toISOString()
      )
      console.log('✅ Email envoyé avec succès')
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError)
      return NextResponse.json({ 
        error: 'Erreur envoi email',
        emailError: emailError instanceof Error ? emailError.message : 'Erreur inconnue',
        mandateNumber: mandate.mandateNumber,
        userEmail: mandate.clientAccount.user.email
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Test signature électronique réussi',
      mandateNumber: mandate.mandateNumber,
      userEmail: mandate.clientAccount.user.email,
      testCode: testCode,
      signatureVerified: mandate.signatureVerified
    })

  } catch (error) {
    console.error('❌ Erreur test signature:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du test',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
} 