import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug session - Headers:", Object.fromEntries(request.headers.entries()))
    console.log("🔍 Debug session - Cookies:", request.cookies.getAll())
    
    const session = await getServerSession(authOptions)
    console.log("🔍 Debug session - Session:", session)
    
    return NextResponse.json({
      success: true,
      hasSession: !!session,
      session: session ? {
        userId: session.user?.id,
        userEmail: session.user?.email,
        userRole: session.user?.role
      } : null,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
      headers: {
        userAgent: request.headers.get('user-agent'),
        accept: request.headers.get('accept'),
        authorization: request.headers.get('authorization')
      },
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
        NODE_ENV: process.env.NODE_ENV
      }
    })

  } catch (error) {
    console.error("❌ Erreur debug session:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors du debug session",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
}
