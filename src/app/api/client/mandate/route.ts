import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Récupérer le mandat actuel du client
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le compte client
    const clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: session.user.id }
    })

    if (!clientAccount) {
      return NextResponse.json({ error: 'Compte client introuvable' }, { status: 404 })
    }

    // Récupérer le mandat actuel (le plus récent)
    const mandate = await prisma.advertisingMandate.findFirst({
      where: { clientAccountId: clientAccount.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: mandate,
      message: mandate ? "Mandat récupéré avec succès" : "Aucun mandat trouvé"
    })

  } catch (error) {
    console.error('❌ Erreur GET /api/client/mandate:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du mandat' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau mandat
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { signedByName, signedByEmail } = body

    if (!signedByName || !signedByEmail) {
      return NextResponse.json(
        { error: 'Nom et email du signataire requis' },
        { status: 400 }
      )
    }

    // Récupérer le compte client
    const clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: session.user.id }
    })

    if (!clientAccount) {
      return NextResponse.json({ error: 'Compte client introuvable' }, { status: 404 })
    }

    // Générer un numéro de mandat unique
    const mandateNumber = `MAN-${Date.now()}-${clientAccount.id.slice(-4)}`
    
    // Dates de validité (1 an)
    const now = new Date()
    const validUntil = new Date()
    validUntil.setFullYear(now.getFullYear() + 1)

    // Créer le nouveau mandat
    const mandate = await prisma.advertisingMandate.create({
      data: {
        clientAccountId: clientAccount.id,
        mandateNumber,
        status: 'ACTIVE',
        signedByName,
        signedByEmail,
        signedAt: now,
        validFrom: now,
        validUntil
      }
    })

    return NextResponse.json({
      success: true,
      data: mandate,
      message: "Mandat créé avec succès"
    })

  } catch (error) {
    console.error('❌ Erreur POST /api/client/mandate:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du mandat' },
      { status: 500 }
    )
  }
}

// PUT - Renouveler un mandat existant
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { mandateId, signedByName, signedByEmail } = body

    if (!mandateId || !signedByName || !signedByEmail) {
      return NextResponse.json(
        { error: 'ID du mandat, nom et email du signataire requis' },
        { status: 400 }
      )
    }

    // Récupérer le compte client
    const clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: session.user.id }
    })

    if (!clientAccount) {
      return NextResponse.json({ error: 'Compte client introuvable' }, { status: 404 })
    }

    // Vérifier que le mandat appartient au client
    const existingMandate = await prisma.advertisingMandate.findFirst({
      where: { 
        id: mandateId,
        clientAccountId: clientAccount.id 
      }
    })

    if (!existingMandate) {
      return NextResponse.json({ error: 'Mandat introuvable' }, { status: 404 })
    }

    // Dates de renouvellement (1 an à partir d'aujourd'hui)
    const now = new Date()
    const validUntil = new Date()
    validUntil.setFullYear(now.getFullYear() + 1)

    // Mettre à jour le mandat
    const updatedMandate = await prisma.advertisingMandate.update({
      where: { id: mandateId },
      data: {
        status: 'ACTIVE',
        signedByName,
        signedByEmail,
        signedAt: now,
        validFrom: now,
        validUntil,
        version: `v${parseFloat(existingMandate.version.replace('v', '')) + 0.1}`
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedMandate,
      message: "Mandat renouvelé avec succès"
    })

  } catch (error) {
    console.error('❌ Erreur PUT /api/client/mandate:', error)
    return NextResponse.json(
      { error: 'Erreur lors du renouvellement du mandat' },
      { status: 500 }
    )
  }
}