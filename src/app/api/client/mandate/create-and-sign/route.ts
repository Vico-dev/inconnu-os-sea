import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EmailService } from '@/lib/email-service'

function generateSignatureCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Début création et signature de mandat')
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📋 Données reçues:', Object.keys(body))

    // Récupérer le compte client
    const clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: session.user.id },
      include: { user: true, company: true }
    })

    if (!clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    // Créer le mandat
    const mandateNumber = `MAN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    
    const mandate = await prisma.advertisingMandate.create({
      data: {
        clientAccountId: clientAccount.id,
        mandateNumber,
        status: 'PENDING',
        version: 'v1.0',
        signedByName: body.signedByName,
        signedByEmail: body.signedByEmail,
        totalAnnualBudget: parseFloat(body.totalAnnualBudget),
        monthlyBudgets: body.monthlyBudgets,
        budgetType: body.budgetType,
        treasuryManagement: body.treasuryManagement || false,
        managementFees: body.managementFees || 0,
        paymentTerms: body.paymentTerms || '',
        termsAccepted: body.termsAccepted,
        gdprAccepted: body.gdprAccepted,
        consentData: body.consentData,
        scrollTracking: body.scrollTracking,
        legalVersion: 'v1.0'
      }
    })

    console.log('✅ Mandat créé:', mandate.mandateNumber)

    // Générer le code de signature
    const signatureCode = generateSignatureCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Sauvegarder le code
    await prisma.advertisingMandate.update({
      where: { id: mandate.id },
      data: {
        signatureCode,
        signatureExpiresAt: expiresAt,
        signatureVerified: false
      }
    })

    console.log('🔐 Code de signature généré:', signatureCode)

    // Envoyer l'email avec le code
    await EmailService.sendSignatureCode(
      clientAccount.user.email,
      clientAccount.user.firstName,
      mandate.mandateNumber,
      signatureCode,
      expiresAt.toISOString()
    )

    console.log('📧 Email de signature envoyé')

    // Envoyer les emails de confirmation
    try {
      await EmailService.sendMandateConfirmation(
        clientAccount.user.email,
        clientAccount.user.firstName,
        mandate.mandateNumber,
        new Date().toISOString(),
        `${body.totalAnnualBudget}€ (${body.budgetType === 'FIXED' ? 'budget fixe' : 'budget variable'})`,
        `${process.env.NEXTAUTH_URL}/client/mandat`
      )

      await EmailService.sendMandateNotificationToAdmin(
        mandate.mandateNumber,
        clientAccount.user.firstName,
        clientAccount.user.lastName,
        clientAccount.company?.name || 'N/A',
        body.totalAnnualBudget,
        body.budgetType
      )
    } catch (emailError) {
      console.error('⚠️ Erreur envoi emails de confirmation:', emailError)
      // On continue même si les emails échouent
    }

    return NextResponse.json({
      success: true,
      message: 'Mandat créé et code de signature envoyé par email',
      mandateNumber: mandate.mandateNumber,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('❌ Erreur lors de la création et signature:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la création du mandat' 
    }, { status: 500 })
  }
} 