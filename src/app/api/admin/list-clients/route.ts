import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'ACCOUNT_MANAGER')) {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 401 })
    }

    const clientAccounts = await prisma.clientAccount.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        company: {
          select: {
            name: true,
            industry: true
          }
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
            amount: true
          }
        }
      }
    })

    const formattedClients = clientAccounts.map(account => ({
      clientAccountId: account.id,
      userId: account.userId,
      userEmail: account.user.email,
      userName: `${account.user.firstName} ${account.user.lastName}`,
      userRole: account.user.role,
      companyName: account.company?.name || 'Non renseignée',
      industry: account.company?.industry || 'Non renseignée',
      onboardingCompleted: account.onboardingCompleted,
      subscriptionPlan: account.subscriptionPlan,
      subscription: account.subscription ? {
        id: account.subscription.id,
        plan: account.subscription.plan,
        status: account.subscription.status,
        amount: account.subscription.amount
      } : null
    }))

    return NextResponse.json({
      success: true,
      clients: formattedClients,
      total: formattedClients.length
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
} 