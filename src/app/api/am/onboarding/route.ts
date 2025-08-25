import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // TODO: Vérifier que l'utilisateur est AM
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ACCOUNT_MANAGER") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    // }

    // Récupérer les vraies données d'onboarding depuis la base de données
    const onboardingData = await prisma.accountManager.findFirst({
      where: {
        // TODO: Ajouter la logique pour récupérer l'AM connecté
      },
      include: {
        onboardingData: true
      }
    })

    return NextResponse.json({
      onboardingData: onboardingData?.onboardingData || null,
      currentStep: onboardingData?.onboardingData?.currentStep || 1
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des données d'onboarding:", error)
    return NextResponse.json({
      error: "Erreur lors de la récupération des données",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // TODO: Vérifier que l'utilisateur est AM
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ACCOUNT_MANAGER") {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    // }

    // Sauvegarder les données d'onboarding
    // Pour l'instant, on simule la sauvegarde
    console.log("Données d'onboarding reçues:", data)

    return NextResponse.json({
      success: true,
      message: "Données d'onboarding sauvegardées"
    })

  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données d'onboarding:", error)
    return NextResponse.json({
      error: "Erreur lors de la sauvegarde",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
} 