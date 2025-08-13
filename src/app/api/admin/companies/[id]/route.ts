import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, website, industry, teamSize, goals, currentChallenges } = body

    // Validation des champs requis
    if (!name || !industry) {
      return NextResponse.json(
        { error: "Le nom et le secteur d'activité sont requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'entreprise existe
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    // Mettre à jour l'entreprise
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name,
        website: website || null,
        industry,
        teamSize: teamSize || null,
        goals: goals || null,
        currentChallenges: currentChallenges || null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Entreprise mise à jour avec succès",
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        website: updatedCompany.website,
        industry: updatedCompany.industry,
        teamSize: updatedCompany.teamSize,
        goals: updatedCompany.goals,
        currentChallenges: updatedCompany.currentChallenges,
        createdAt: updatedCompany.createdAt,
        updatedAt: updatedCompany.updatedAt
      }
    })

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de la mise à jour de l'entreprise",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Vérifier que l'entreprise existe
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      include: {
        clientAccounts: true
      }
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Entreprise non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier qu'il n'y a pas de comptes clients associés
    if (existingCompany.clientAccounts.length > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une entreprise qui a des comptes clients associés" },
        { status: 400 }
      )
    }

    // Supprimer l'entreprise
    await prisma.company.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Entreprise supprimée avec succès"
    })

  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de la suppression de l'entreprise",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
} 