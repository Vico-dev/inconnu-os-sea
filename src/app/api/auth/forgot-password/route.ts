import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { EmailService } from "@/lib/email-service"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return NextResponse.json({
        success: true,
        message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation."
      })
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: resetToken, // Réutiliser le champ existant
        emailVerificationExpires: resetExpires
      }
    })

    // Envoyer l'email de réinitialisation
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    
    try {
      await EmailService.sendPasswordReset(
        user.email,
        user.firstName,
        resetUrl
      )
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email de réinitialisation:", emailError)
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation."
    })

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    return NextResponse.json(
      { error: "Erreur lors de la demande de réinitialisation" },
      { status: 500 }
    )
  }
} 