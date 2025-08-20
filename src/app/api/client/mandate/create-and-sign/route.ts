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
    const sessionUserId = (session.user as any).id || (session.user as any).sub || null
    const sessionEmail = (session.user as any).email || null
    
    let clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: sessionUserId ?? undefined },
      include: { user: true, company: true }
    })
    
    if (!clientAccount && sessionEmail) {
      const user = await prisma.user.findUnique({ where: { email: sessionEmail } })
      if (user) {
        clientAccount = await prisma.clientAccount.findFirst({
          where: { userId: user.id },
          include: { user: true, company: true }
        })
      }
    }

    if (!clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    // Calculer le budget total côté serveur
    let computedTotal = 0
    if (body.budgetType === 'FIXED') {
      computedTotal = Number.parseFloat(String(body.totalAnnualBudget || 0))
    } else if (Array.isArray(body.monthlyBudgets)) {
      computedTotal = body.monthlyBudgets.reduce((sum: number, mb: any) => sum + (Number(mb?.amount) || 0), 0)
    }
    if (!Number.isFinite(computedTotal)) {
      console.error('❌ Budget total invalide', body.totalAnnualBudget, body.monthlyBudgets)
      return NextResponse.json({ error: 'Budget total invalide' }, { status: 400 })
    }

    // Créer le mandat avec CHAMP MINIMUM
    const mandateNumber = `MAN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    
    // Utiliser seulement les champs qui existent certainement en production
    const mandateData = {
      clientAccountId: clientAccount.id.toString(), // Convertir en string
      mandateNumber,
      status: 'PENDING',
      version: 'v1.0',
      signedByName: session.user.name || `${(session.user as any).firstName || ''} ${(session.user as any).lastName || ''}`.trim(),
      signedByEmail: session.user.email!,
      totalAnnualBudget: computedTotal,
      monthlyBudgets: body.budgetType === 'VARIABLE' ? body.monthlyBudgets : null,
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

    console.log('📝 Tentative création mandat avec données:', Object.keys(mandateData))

    let mandate
    try {
      mandate = await prisma.advertisingMandate.create({
        data: mandateData
      })
      console.log('✅ Mandat créé avec succès:', mandate.mandateNumber)
    } catch (dbError: any) {
      console.error('❌ Erreur création mandat:', dbError)
      return NextResponse.json({ 
        error: 'Erreur lors de la création du mandat',
        details: dbError.message,
        code: dbError.code
      }, { status: 500 })
    }

    // Générer le code de signature
    const signatureCode = generateSignatureCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    console.log('🔐 Code de signature généré:', signatureCode)

    // Envoyer l'email avec le code
    console.log('📧 Tentative envoi email à:', clientAccount.user.email)
    
    try {
      await EmailService.sendSignatureCode(
        clientAccount.user.email,
        clientAccount.user.firstName,
        mandate.mandateNumber,
        signatureCode,
        expiresAt.toISOString()
      )
      console.log('✅ Email de signature envoyé avec succès')
    } catch (emailError) {
      console.error('❌ Erreur envoi email de signature:', emailError)
      // On continue même si l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Mandat créé et code de signature envoyé par email',
      mandateNumber: mandate.mandateNumber,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error: any) {
    console.error('❌ Erreur lors de la création et signature:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la création du mandat',
      details: error?.message || String(error)
    }, { status: 500 })
  }
} 