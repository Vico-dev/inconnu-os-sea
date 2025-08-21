import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID requis" },
        { status: 400 }
      )
    }

    // Valider le format du Customer ID (10 chiffres)
    if (!/^\d{10}$/.test(customerId)) {
      return NextResponse.json(
        { error: "Customer ID doit contenir 10 chiffres" },
        { status: 400 }
      )
    }

    // Mettre à jour la connexion MCC avec le vrai Customer ID
    await prisma.googleAdsConnection.updateMany({
      where: { 
        userId: session.user.id,
        accounts: {
          contains: '0000000000' // Ancien ID temporaire
        }
      },
      data: {
        accounts: JSON.stringify([{
          customerId: customerId,
          name: `MCC - ${customerId}`,
          isManager: true
        }])
      }
    })

    return NextResponse.json({
      success: true,
      message: `Customer ID MCC configuré : ${customerId}`
    })

  } catch (error) {
    console.error('Erreur lors de la configuration du Customer ID:', error)
    return NextResponse.json(
      { error: "Erreur lors de la configuration" },
      { status: 500 }
    )
  }
}

// Endpoint GET pour tester
export async function GET() {
  console.log('🔍 GET configure-customer appelé')
  return NextResponse.json({ message: "Endpoint configure-customer fonctionne" })
}