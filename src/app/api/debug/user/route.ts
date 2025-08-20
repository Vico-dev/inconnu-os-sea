import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clientAccount: {
          include: {
            company: true,
            subscription: true
          }
        },
        accountManager: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Retourner les données sans le mot de passe
    const { password, ...userData } = user

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error: any) {
    console.error('Erreur debug user:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error.message 
    }, { status: 500 })
  }
} 