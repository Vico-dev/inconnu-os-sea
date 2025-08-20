import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

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

    // Test de création d'un mandat minimal
    const mandateNumber = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    
    const mandateData = {
      clientAccountId: clientAccount.id,
      mandateNumber,
      status: 'PENDING',
      version: 'v1.0',
      signedByName: session.user.name || 'Test User',
      signedByEmail: session.user.email!,
      totalAnnualBudget: 1000,
      budgetType: 'FIXED',
      treasuryManagement: false,
      managementFees: 0,
      paymentTerms: '',
      termsAccepted: true,
      gdprAccepted: true,
      consentData: { test: true },
      scrollTracking: { test: true },
      legalVersion: 'v1.0'
    }

    const mandate = await prisma.advertisingMandate.create({
      data: mandateData
    })

    // Supprimer le mandat de test
    await prisma.advertisingMandate.delete({
      where: { id: mandate.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Test de création de mandat réussi',
      clientAccount: {
        id: clientAccount.id,
        user: {
          name: clientAccount.user.firstName,
          email: clientAccount.user.email
        }
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur test mandat:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du test',
      details: error?.message || String(error),
      code: error?.code
    }, { status: 500 })
  }
} 