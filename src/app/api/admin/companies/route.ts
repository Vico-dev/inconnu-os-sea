import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const companies = await prisma.company.findMany({
      include: {
        clientAccounts: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            subscription: {
              select: {
                plan: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      companies: companies.map(company => ({
        id: company.id,
        name: company.name,
        website: company.website,
        industry: company.industry,
        teamSize: company.teamSize,
        goals: company.goals,
        currentChallenges: company.currentChallenges,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        clientAccounts: company.clientAccounts
      }))
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 