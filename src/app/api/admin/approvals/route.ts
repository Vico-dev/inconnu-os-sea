import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ApprovalService } from '@/lib/approval-service'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole') as any

    if (userId && userRole) {
      // Récupérer les approbations en attente pour un utilisateur
      const pendingApprovals = await ApprovalService.getPendingApprovals(userId, userRole)
      return NextResponse.json(pendingApprovals)
    }

    // Récupérer toutes les approbations (pour les admins)
    const approvals = await db.campaignApproval.findMany({
      include: {
        campaign: {
          include: {
            client: true
          }
        },
        approvals: {
          orderBy: { stepNumber: 'asc' }
        },
        history: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(approvals)
  } catch (error) {
    console.error('Erreur lors de la récupération des approbations:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, approvers } = body

    // Créer le workflow d'approbation
    const approval = await ApprovalService.createApprovalWorkflow({
      campaignId,
      submittedBy: session.user.id,
      approvers
    })

    return NextResponse.json(approval)
  } catch (error) {
    console.error('Erreur lors de la création du workflow d\'approbation:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 