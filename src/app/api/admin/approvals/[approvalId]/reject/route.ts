import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ApprovalService } from '@/lib/approval-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { approvalId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { approvalId } = params
    const body = await request.json()
    const { stepNumber, comments } = body

    if (!comments) {
      return NextResponse.json(
        { error: 'Les commentaires sont requis pour un rejet' },
        { status: 400 }
      )
    }

    const approval = await ApprovalService.rejectStep(
      approvalId,
      stepNumber,
      session.user.id,
      comments
    )

    return NextResponse.json(approval)
  } catch (error) {
    console.error('Erreur lors du rejet:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 