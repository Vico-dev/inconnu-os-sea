import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { clientAccount: true }
    })

    if (!user?.clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    await prisma.clientAccount.update({
      where: { userId: user.id },
      data: { onboardingCompleted: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Onboarding terminé !'
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
} 