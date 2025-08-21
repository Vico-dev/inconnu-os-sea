import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email déjà vérifié' }, { status: 400 })
    }

    // Générer un token de vérification sécurisé
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Sauvegarder le token
    await prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: expiresAt
      }
    })

    // Envoyer l'email de vérification
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`

    try {
      await import('@/lib/email-service').then(({ EmailService }) => 
        EmailService.sendEmailVerification(
          email,
          user.firstName,
          verificationUrl
        )
      )
    } catch (emailError) {
      console.error('Erreur envoi email de vérification:', emailError)
      return NextResponse.json({ 
        error: 'Erreur lors de l\'envoi de l\'email de vérification' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email de vérification envoyé' 
    })

  } catch (error: any) {
    console.error('Erreur vérification email:', error)
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      // Rediriger vers la page de validation avec une erreur
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-email?error=missing_token`
      )
    }

    // Trouver l'utilisateur avec ce token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      // Rediriger vers la page de validation avec une erreur d'expiration
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/verify-email?error=expired_token`
      )
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        emailVerifiedAt: new Date()
      }
    })

    // Rediriger vers la page de validation avec succès
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/verify-email?success=true&email=${encodeURIComponent(user.email)}`
    )

  } catch (error: any) {
    console.error('Erreur vérification token:', error)
    // Rediriger vers la page de validation avec une erreur
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/verify-email?error=server_error`
    )
  }
} 