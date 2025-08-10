import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcryptjs from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token et nouveau mot de passe requis" },
        { status: 400 }
      )
    }

    // Vérifier la force du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur avec ce token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Token de réinitialisation invalide" },
        { status: 400 }
      )
    }

    // Vérifier si le token n'a pas expiré
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: "Le lien de réinitialisation a expiré" },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcryptjs.hash(password, 12)

    // Mettre à jour le mot de passe et effacer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès"
    })

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation du mot de passe" },
      { status: 500 }
    )
  }
} 