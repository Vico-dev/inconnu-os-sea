import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      include: {
        clientAccount: true
      }
    })

    return NextResponse.json({
      message: "Test réussi",
      users: users
    })

  } catch (error) {
    console.error("Erreur lors du test:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 