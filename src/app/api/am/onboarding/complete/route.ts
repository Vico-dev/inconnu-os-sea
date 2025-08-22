import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // TODO: Vérifier que l'utilisateur est AM
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ACCOUNT_MANAGER") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    // }

    // Finaliser l'onboarding
    // Pour l'instant, on simule la finalisation
    console.log("Finalisation de l'onboarding AM:", data)

    // TODO: Mettre à jour le profil AM dans la base de données
    // await prisma.accountManager.update({
    //   where: { userId: session.user.id },
    //   data: {
    //     calendlyLink: data.calendlyLink,
    //     gmailCalendarLink: data.gmailCalendarLink,
    //     preferredContactMethod: data.preferredContactMethod,
    //     availability: data.availability,
    //     specializations: data.specializations,
    //     bio: data.bio,
    //     onboardingCompleted: true
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: "Onboarding finalisé avec succès"
    })

  } catch (error) {
    console.error("Erreur lors de la finalisation de l'onboarding:", error)
    return NextResponse.json({
      error: "Erreur lors de la finalisation",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
} 