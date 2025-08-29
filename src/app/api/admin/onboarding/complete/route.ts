import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'ACCOUNT_MANAGER')) {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body as { email?: string }

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: { clientAccount: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (!user.clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé pour cet utilisateur' }, { status: 404 })
    }

    // Marquer l'onboarding comme terminé
    await prisma.clientAccount.update({
      where: { userId: user.id },
      data: { onboardingCompleted: true }
    })

    return NextResponse.json({
      success: true,
      message: `Onboarding marqué comme terminé pour ${email}`,
      clientAccountId: user.clientAccount.id
    })

  } catch (error) {
    console.error('Erreur lors de la finalisation de l\'onboarding:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
} 