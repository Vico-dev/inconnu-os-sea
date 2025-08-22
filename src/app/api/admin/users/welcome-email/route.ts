import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { EmailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json()
    
    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientAccount: {
          include: {
            company: true
          }
        },
        accountManager: {
          include: {
            company: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Envoyer l'email selon le rôle
    if (role === "CLIENT") {
      await EmailService.sendNewUserWelcomeEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: "CLIENT",
        companyName: user.clientAccount?.company?.name || "Votre entreprise",
        onboardingUrl: `${process.env.NEXTAUTH_URL}/onboarding?email=${encodeURIComponent(user.email)}`,
        type: "client_welcome"
      })
    } else if (role === "ACCOUNT_MANAGER") {
      await EmailService.sendNewUserWelcomeEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: "ACCOUNT_MANAGER",
        onboardingUrl: `${process.env.NEXTAUTH_URL}/am/onboarding?email=${encodeURIComponent(user.email)}`,
        type: "am_welcome"
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Email de bienvenue envoyé avec succès" 
    })

  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de bienvenue:", error)
    return NextResponse.json({
      error: "Erreur lors de l'envoi de l'email",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
} 