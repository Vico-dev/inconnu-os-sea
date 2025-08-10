import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=token_missing`)
    }

    // Trouver l'utilisateur avec ce token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token }
    })

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=invalid_token`)
    }

    // Vérifier si le token n'a pas expiré
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=token_expired`)
    }

    // Valider l'email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?message=email_verified`)

  } catch (error) {
    console.error('Erreur lors de la validation email:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=verification_failed`)
  }
} 