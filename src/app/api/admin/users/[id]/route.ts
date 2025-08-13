import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("🔍 Vérification de l'authentification admin...")
    
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    console.log("📋 Session récupérée:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'ADMIN'
    })
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      console.log("❌ Accès refusé - Session invalide ou non admin")
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }
    
    console.log("✅ Authentification admin validée")

    const { id } = await params

    // Récupérer l'utilisateur avec ses relations
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        clientAccount: {
          include: {
            company: true,
            subscription: true
          }
        },
        accountManager: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        clientAccount: user.clientAccount,
        accountManager: user.accountManager
      }
    })

  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors de la récupération de l'utilisateur",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
} 