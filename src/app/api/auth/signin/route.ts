import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 }
      )
    }

    // Rechercher l&apos;utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clientAccount: true,
        accountManager: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    // Retourner les informations de l&apos;utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Connexion réussie",
      user: {
        ...userWithoutPassword,
        name: `${user.firstName} ${user.lastName}` // Ajouter le nom complet
      },
      role: user.role
    })

  } catch (error) {
    console.error("Erreur lors de la connexion:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 