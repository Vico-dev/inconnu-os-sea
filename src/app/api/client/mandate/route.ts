import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const { signedByName, signedByEmail, budgetType, totalAnnualBudget, monthlyBudgets } = body

    // Récupérer le compte client
    const clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: session.user.id }
    })

    if (!clientAccount) {
      return NextResponse.json({ success: false, error: 'Compte client non trouvé' }, { status: 404 })
    }

    // Générer un numéro de mandat unique
    const mandateNumber = `MND-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

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
        monthlyBudgets: monthlyBudgets ? JSON.stringify(monthlyBudgets) : null
      }
    })

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
    const { mandateId, signedByName, signedByEmail, budgetType, totalAnnualBudget, monthlyBudgets } = body

    // Vérifier que le mandat appartient au client
    const existingMandate = await prisma.advertisingMandate.findFirst({
      where: {
        id: mandateId,
        clientAccount: {
          userId: session.user.id
        }
      }
    })

    if (!existingMandate) {
      return NextResponse.json({ success: false, error: 'Mandat non trouvé' }, { status: 404 })
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
        monthlyBudgets: monthlyBudgets ? JSON.stringify(monthlyBudgets) : null
      }
    })

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