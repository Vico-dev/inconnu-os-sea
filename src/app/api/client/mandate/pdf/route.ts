import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PDFService } from '@/lib/pdf-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le mandat du client
    const mandate = await prisma.advertisingMandate.findFirst({
      where: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!mandate) {
      return NextResponse.json({ error: 'Aucun mandat trouvé' }, { status: 404 })
    }

    // Préparer les données pour le PDF
    const pdfData = {
      mandateNumber: mandate.mandateNumber,
      clientName: mandate.clientAccount.user.firstName + ' ' + mandate.clientAccount.user.lastName,
      companyName: mandate.clientAccount.company?.name,
      signedByName: mandate.signedByName || '',
      signedByEmail: mandate.signedByEmail || '',
      signedAt: mandate.signedAt?.toISOString() || '',
      validFrom: mandate.validFrom?.toISOString() || '',
      validUntil: mandate.validUntil?.toISOString() || '',
      budgetType: mandate.budgetType || 'FIXED',
      totalAnnualBudget: mandate.totalAnnualBudget || 0,
      monthlyBudgets: mandate.monthlyBudgets ? JSON.parse(mandate.monthlyBudgets as string) : null,
      treasuryManagement: mandate.treasuryManagement || false,
      managementFees: mandate.managementFees || 0,
      paymentTerms: mandate.paymentTerms || ''
    }

    // Générer le PDF
    const pdfBuffer = await PDFService.generateMandatePDF(pdfData)

    // Retourner le HTML pour affichage dans le navigateur
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('❌ Erreur lors de la génération du PDF:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la génération du PDF' 
    }, { status: 500 })
  }
} 