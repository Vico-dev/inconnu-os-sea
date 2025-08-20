import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EmailService } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test envoi email - Début')
    
    const session = await getServerSession(authOptions)
    console.log('📋 Session:', session ? 'Trouvée' : 'Non trouvée')
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: 'Non autorisé',
        session: null
      }, { status: 401 })
    }

    console.log('👤 Utilisateur:', session.user.email)

    // Test simple d'envoi d'email
    try {
      console.log('📧 Test envoi email simple à:', session.user.email)
      
      const result = await EmailService.sendSignatureCode(
        session.user.email,
        session.user.firstName || 'Test',
        'TEST-123',
        'ABC123',
        new Date(Date.now() + 15 * 60 * 1000).toISOString()
      )
      
      console.log('✅ Email de test envoyé:', result)
      
      return NextResponse.json({ 
        success: true,
        message: 'Email de test envoyé avec succès',
        userEmail: session.user.email,
        result: result
      })
      
    } catch (emailError) {
      console.error('❌ Erreur envoi email de test:', emailError)
      return NextResponse.json({ 
        error: 'Erreur envoi email de test',
        emailError: emailError instanceof Error ? emailError.message : 'Erreur inconnue',
        userEmail: session.user.email
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erreur test email:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du test email',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
} 