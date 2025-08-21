import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const { clientAccountId, accountManagerId, note } = await request.json()
    if (!clientAccountId || !accountManagerId) {
      return NextResponse.json({ error: 'clientAccountId et accountManagerId requis' }, { status: 400 })
    }

    const [clientAccount, accountManager] = await Promise.all([
      prisma.clientAccount.findUnique({
        where: { id: clientAccountId },
        include: { company: true, user: true }
      }),
      prisma.accountManager.findUnique({
        where: { id: accountManagerId },
        include: { user: true }
      })
    ])

    if (!clientAccount) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }
    if (!accountManager) {
      return NextResponse.json({ error: 'Account Manager introuvable' }, { status: 404 })
    }

    // Mettre à jour l'attribution
    const updated = await prisma.clientAccount.update({
      where: { id: clientAccount.id },
      data: { assignedAccountManagerId: accountManager.id }
    })

    // Notifier l'AM assigné
    if (accountManager.user?.id) {
      await prisma.notification.create({
        data: {
          userId: accountManager.user.id,
          clientAccountId: clientAccount.id,
          type: 'info',
          title: 'Nouveau client assigné',
          message: `Le client ${clientAccount.company?.name || clientAccount.user.firstName} vous a été assigné. ${note ? 'Note: ' + note : ''}`,
          actionUrl: '/am/clients',
          priority: 'high'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'AM attribué avec succès',
      clientAccountId: updated.id,
      accountManagerId: accountManager.id
    })
  } catch (error) {
    console.error('Erreur assignation AM:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

