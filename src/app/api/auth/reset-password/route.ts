import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcryptjs from "bcryptjs"
import { rateLimiters } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimiters.auth(request)
    if (limited) return limited

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

    // Validation supplémentaire du mot de passe (optionnelle mais recommandée)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial" },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur avec ce token de réinitialisation
    const user = await prisma.user.findFirst({
      where: { 
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Token de réinitialisation invalide ou expiré" },
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
        passwordResetToken: null,
        passwordResetExpires: null
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