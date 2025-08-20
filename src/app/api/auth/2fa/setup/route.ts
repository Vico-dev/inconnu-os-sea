import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    // Générer une clé secrète pour la 2FA
    const secret = authenticator.generateSecret()
    const user = session.user.email!
    
    // Créer l'URL pour le QR code
    const otpauth = authenticator.keyuri(user, 'Agence Inconnu', secret)
    
    // Générer le QR code
    const qrCodeUrl = await QRCode.toDataURL(otpauth)

    // Sauvegarder la clé secrète (temporairement, en attente de validation)
    await prisma.user.update({
      where: { email: user },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: false // Pas encore activé
      }
    })

    return NextResponse.json({
      success: true,
      secret,
      qrCodeUrl,
      otpauth
    })

  } catch (error: any) {
    console.error('Erreur setup 2FA:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la configuration de la 2FA' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 400 })
    }

    // Récupérer la clé secrète de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: '2FA non configurée' }, { status: 400 })
    }

    // Vérifier le token
    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Code 2FA invalide' }, { status: 400 })
    }

    // Activer la 2FA
    await prisma.user.update({
      where: { email: session.user.email! },
      data: {
        twoFactorEnabled: true,
        twoFactorEnabledAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: '2FA activée avec succès'
    })

  } catch (error: any) {
    console.error('Erreur activation 2FA:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de l\'activation de la 2FA' 
    }, { status: 500 })
  }
} 