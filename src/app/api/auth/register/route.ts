import { NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { prisma } from "@/lib/db"
import { EmailService } from "@/lib/email-service"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, company, role } = body

    // Validation des données
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      )
    }

    // Restreindre l&apos;inscription publique aux clients uniquement
    if (role && role !== "client") {
      return NextResponse.json(
        { message: "Seuls les comptes clients peuvent être créés publiquement" },
        { status: 403 }
      )
    }

    // Vérifier si l&apos;utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcryptjs.hash(password, 12)

    // Générer un token de validation d'email
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures

    // Créer l&apos;utilisateur (toujours en tant que client pour l&apos;inscription publique)
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: "CLIENT", // Forcer le rôle client pour l&apos;inscription publique
        company: company || null,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      }
    })

    // Créer une Company temporaire
    const companyRecord = await prisma.company.create({
      data: {
        name: company || "Entreprise temporaire",
        industry: "Non spécifié"
      }
    })

    // Créer le compte client avec la Company
    const clientAccount = await prisma.clientAccount.create({
      data: {
        userId: user.id,
        companyId: companyRecord.id,
        status: "ACTIVE"
      }
    })

    // Créer un abonnement d&apos;essai
    await prisma.subscription.create({
      data: {
        clientAccountId: clientAccount.id,
        plan: "BASIC",
        status: "TRIAL",
        amount: 0,
        currency: "EUR",
        trialStart: new Date(),
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 jours d&apos;essai
      }
    })

    console.log("Utilisateur créé avec succès:", { id: user.id, email: user.email })

    // Envoyer un email de validation
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`
      
      await EmailService.sendEmailVerification(
        user.email,
        user.firstName,
        verificationUrl
      )
    } catch (emailError) {
      console.error("Erreur lors de l&apos;envoi de l&apos;email de validation:", emailError)
      // Ne pas faire échouer l&apos;inscription si l&apos;email échoue
    }

    return NextResponse.json(
      { message: "Compte créé avec succès. Veuillez vérifier votre email pour valider votre compte." },
      { status: 201 }
    )

  } catch (error) {
    console.error("Erreur détaillée lors de l&apos;inscription:", error)
    
    // Gestion spécifique des erreurs Prisma
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { message: "Un utilisateur avec cet email existe déjà" },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { message: "Erreur interne du serveur lors de la création du compte" },
      { status: 500 }
    )
  }
} 