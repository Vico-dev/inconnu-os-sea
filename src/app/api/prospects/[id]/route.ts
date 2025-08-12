import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, score, budget } = body

    // Validation du statut
    const validStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    // Validation du score
    if (score !== undefined && (score < 1 || score > 10)) {
      return NextResponse.json(
        { error: 'Score doit être entre 1 et 10' },
        { status: 400 }
      )
    }

    // Mettre à jour le prospect
    const updatedProspect = await prisma.prospect.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(score !== undefined && { score }),
        ...(budget !== undefined && { budget }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Prospect mis à jour avec succès',
      prospect: updatedProspect
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du prospect:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prospect = await prisma.prospect.findUnique({
      where: { id }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ prospect })
  } catch (error) {
    console.error('Erreur lors de la récupération du prospect:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.prospect.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Prospect supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du prospect:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 