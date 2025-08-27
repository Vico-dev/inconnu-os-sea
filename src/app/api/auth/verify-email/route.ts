import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { message: "Token de validation manquant" },
        { status: 400 }
      )
    }

    // En mode développement, on peut valider automatiquement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Mode développement - Validation automatique')
      
      // Trouver l'utilisateur par token ou valider le premier utilisateur non validé
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { emailVerificationToken: token },
            { emailVerified: false }
          ]
        }
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null
          }
        })

        console.log(`✅ Email validé pour ${user.email}`)
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?message=email_verified`)
      }
    }

    // Validation normale avec token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Token invalide ou expiré" },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    console.log(`✅ Email validé pour ${user.email}`)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?message=email_verified`)

  } catch (error) {
    console.error("Erreur validation email:", error)
    return NextResponse.json(
      { message: "Erreur lors de la validation de l'email" },
      { status: 500 }
    )
  }
} 