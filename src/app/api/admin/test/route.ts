import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Test endpoint admin...")
    
    const session = await getServerSession(authOptions)
    console.log("📋 Session dans test:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'ADMIN'
    })
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test admin réussi",
      user: {
        id: session.user.id,
        role: session.user.role
      }
    })

  } catch (error) {
    console.error("Erreur test admin:", error)
    return NextResponse.json(
      { error: "Erreur test admin" },
      { status: 500 }
    )
  }
} 