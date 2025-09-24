import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { EmailService } from "@/lib/email-service"
import crypto from "crypto"
import { rateLimiters } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimiters.auth(request)
    if (limited) return limited

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Aucun utilisateur trouvé avec cet email" },
        { status: 404 }
      )
    }

    // Vérifier si l'email est déjà validé
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Cet email est déjà validé" },
        { status: 400 }
      )
    }

    // Générer un nouveau token de validation
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Mettre à jour l'utilisateur avec le nouveau token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      }
    })

    // Envoyer le nouvel email de validation
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`
    
    await EmailService.sendEmailVerification(
      user.email,
      user.firstName,
      verificationUrl
    )

    return NextResponse.json({
      success: true,
      message: "Email de validation renvoyé avec succès"
    })

  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email de validation:', error)
    return NextResponse.json(
      { error: "Erreur lors du renvoi de l'email de validation" },
      { status: 500 }
    )
  }
} 