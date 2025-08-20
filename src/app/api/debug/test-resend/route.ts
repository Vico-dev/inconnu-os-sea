import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import resend from '@/lib/resend'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier la configuration Resend
    const config = {
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      resendInstance: !!resend,
      fromEmail: 'Agence Inconnu <noreply@agence-inconnu.fr>'
    }

    // Test d'envoi d'email simple
    let testResult = null
    let testError = null

    if (resend) {
      try {
        testResult = await resend.emails.send({
          from: 'Agence Inconnu <noreply@agence-inconnu.fr>',
          to: [session.user.email!],
          subject: 'Test Resend - Agence Inconnu',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">Test Resend</h2>
              <p>Bonjour ${session.user.name || 'Utilisateur'},</p>
              <p>Ceci est un test de configuration Resend.</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
          `,
        })
        console.log('✅ Test email envoyé avec succès:', testResult)
      } catch (error: any) {
        testError = {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode
        }
        console.error('❌ Erreur test email:', error)
      }
    }

    return NextResponse.json({
      success: true,
      config,
      testResult,
      testError,
      userEmail: session.user.email
    })

  } catch (error: any) {
    console.error('❌ Erreur test Resend:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du test',
      details: error?.message || String(error)
    }, { status: 500 })
  }
} 