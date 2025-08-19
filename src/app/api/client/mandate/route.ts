import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EmailService } from '@/lib/email-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le mandat du client connecté
    const mandate = await prisma.advertisingMandate.findFirst({
      where: {
        clientAccount: {
          userId: session.user.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: mandate 
    })
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du mandat:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la récupération du mandat' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      signedByName, 
      signedByEmail, 
      budgetType, 
      totalAnnualBudget, 
      monthlyBudgets,
      termsAccepted,
      gdprAccepted,
      consentData,
      scrollTracking
    } = body

    // Validation juridique
    if (!termsAccepted || !gdprAccepted) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vous devez accepter les conditions et le traitement des données' 
      }, { status: 400 })
    }

    // Récupérer le compte client
    const clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: session.user.id },
      include: {
        user: true,
        company: true
      }
    })

    if (!clientAccount) {
      return NextResponse.json({ success: false, error: 'Compte client non trouvé' }, { status: 404 })
    }

    // Générer un numéro de mandat unique
    const mandateNumber = `MND-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Préparer les données de traçabilité
    const trackingData = {
      consentData: {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        sessionId: session.user.id,
        ...consentData
      },
      scrollTracking: scrollTracking || {},
      emailConfirmation: {
        sent: false,
        sentAt: null,
        opened: false,
        openedAt: null
      }
    }

    // Créer le mandat
    const mandate = await prisma.advertisingMandate.create({
      data: {
        clientAccountId: clientAccount.id,
        mandateNumber,
        status: 'ACTIVE',
        version: 'v1.0',
        signedByName,
        signedByEmail,
        signedAt: new Date(),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
        budgetType,
        totalAnnualBudget: totalAnnualBudget ? parseFloat(totalAnnualBudget) : null,
        monthlyBudgets: monthlyBudgets ? JSON.stringify(monthlyBudgets) : null,
        termsAccepted,
        gdprAccepted,
        consentData: JSON.stringify(trackingData.consentData),
        scrollTracking: JSON.stringify(trackingData.scrollTracking),
        emailConfirmation: JSON.stringify(trackingData.emailConfirmation),
        legalVersion: 'v1.0'
      }
    })

    // Envoyer email de confirmation au client
    try {
      const budgetInfo = budgetType === 'FIXED' 
        ? `${totalAnnualBudget} € (annuel fixe)`
        : `${monthlyBudgets?.reduce((sum: number, mb: any) => sum + (mb.amount || 0), 0)} € (annuel variable)`

      await EmailService.sendMandateConfirmation(
        clientAccount.user.email,
        clientAccount.user.firstName || 'Client',
        mandateNumber,
        mandate.signedAt!.toISOString(),
        budgetInfo,
        `${process.env.NEXTAUTH_URL}/client/mandat`
      )

      // Mettre à jour le statut d'envoi
      await prisma.advertisingMandate.update({
        where: { id: mandate.id },
        data: {
          emailConfirmation: JSON.stringify({
            sent: true,
            sentAt: new Date().toISOString(),
            opened: false,
            openedAt: null
          })
        }
      })
    } catch (emailError) {
      console.error('❌ Erreur envoi email de confirmation:', emailError)
      // On continue même si l'email échoue
    }

    // Envoyer notification aux admins
    try {
      const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' }
      })

      const budgetInfo = budgetType === 'FIXED' 
        ? `${totalAnnualBudget} € (annuel fixe)`
        : `${monthlyBudgets?.reduce((sum: number, mb: any) => sum + (mb.amount || 0), 0)} € (annuel variable)`

      for (const admin of adminUsers) {
        await EmailService.sendMandateNotificationToAdmin(
          admin.email,
          clientAccount.user.firstName + ' ' + clientAccount.user.lastName,
          clientAccount.company?.name || 'Sans entreprise',
          mandateNumber,
          budgetInfo,
          `${process.env.NEXTAUTH_URL}/admin/clients/${clientAccount.id}`
        )
      }
    } catch (adminEmailError) {
      console.error('❌ Erreur envoi notification admin:', adminEmailError)
      // On continue même si l'email échoue
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mandat créé avec succès',
      data: mandate 
    })
  } catch (error) {
    console.error('❌ Erreur lors de la création du mandat:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la création du mandat' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      mandateId, 
      signedByName, 
      signedByEmail, 
      budgetType, 
      totalAnnualBudget, 
      monthlyBudgets,
      termsAccepted,
      gdprAccepted,
      consentData,
      scrollTracking
    } = body

    // Validation juridique
    if (!termsAccepted || !gdprAccepted) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vous devez accepter les conditions et le traitement des données' 
      }, { status: 400 })
    }

    // Vérifier que le mandat appartient au client
    const existingMandate = await prisma.advertisingMandate.findFirst({
      where: {
        id: mandateId,
        clientAccount: {
          userId: session.user.id
        }
      },
      include: {
        clientAccount: {
          include: {
            user: true,
            company: true
          }
        }
      }
    })

    if (!existingMandate) {
      return NextResponse.json({ success: false, error: 'Mandat non trouvé' }, { status: 404 })
    }

    // Préparer les données de traçabilité
    const trackingData = {
      consentData: {
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        sessionId: session.user.id,
        isRenewal: true,
        ...consentData
      },
      scrollTracking: scrollTracking || {},
      emailConfirmation: {
        sent: false,
        sentAt: null,
        opened: false,
        openedAt: null
      }
    }

    // Mettre à jour le mandat
    const updatedMandate = await prisma.advertisingMandate.update({
      where: { id: mandateId },
      data: {
        signedByName,
        signedByEmail,
        signedAt: new Date(),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
        status: 'ACTIVE',
        budgetType,
        totalAnnualBudget: totalAnnualBudget ? parseFloat(totalAnnualBudget) : null,
        monthlyBudgets: monthlyBudgets ? JSON.stringify(monthlyBudgets) : null,
        termsAccepted,
        gdprAccepted,
        consentData: JSON.stringify(trackingData.consentData),
        scrollTracking: JSON.stringify(trackingData.scrollTracking),
        emailConfirmation: JSON.stringify(trackingData.emailConfirmation),
        legalVersion: 'v1.0'
      }
    })

    // Envoyer email de confirmation au client
    try {
      const budgetInfo = budgetType === 'FIXED' 
        ? `${totalAnnualBudget} € (annuel fixe)`
        : `${monthlyBudgets?.reduce((sum: number, mb: any) => sum + (mb.amount || 0), 0)} € (annuel variable)`

      await EmailService.sendMandateConfirmation(
        existingMandate.clientAccount.user.email,
        existingMandate.clientAccount.user.firstName || 'Client',
        existingMandate.mandateNumber,
        updatedMandate.signedAt!.toISOString(),
        budgetInfo,
        `${process.env.NEXTAUTH_URL}/client/mandat`
      )

      // Mettre à jour le statut d'envoi
      await prisma.advertisingMandate.update({
        where: { id: mandateId },
        data: {
          emailConfirmation: JSON.stringify({
            sent: true,
            sentAt: new Date().toISOString(),
            opened: false,
            openedAt: null
          })
        }
      })
    } catch (emailError) {
      console.error('❌ Erreur envoi email de confirmation:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mandat mis à jour avec succès',
      data: updatedMandate 
    })
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du mandat:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour du mandat' 
    }, { status: 500 })
  }
}