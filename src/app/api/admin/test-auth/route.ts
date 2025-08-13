import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Test d'authentification admin...")
    
    const session = await getServerSession(authOptions)
    console.log("📋 Session complète:", session)
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: {
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userRole: session?.user?.role,
        isAdmin: session?.user?.role === 'ADMIN'
      }
    })

  } catch (error) {
    console.error("Erreur lors du test d'authentification:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors du test d'authentification",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
} 