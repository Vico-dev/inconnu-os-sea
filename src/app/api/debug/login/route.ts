import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { rateLimiters } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const limited = rateLimiters.auth(request)
    if (limited) return limited

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    console.log("🔍 Test de connexion pour:", email)

    // Test direct avec le provider credentials
    const result = await authOptions.providers[0].authorize({
      email,
      password
    }, {
      body: { email, password },
      query: {},
      headers: request.headers
    })

    console.log("🔍 Résultat authorize:", result)

    if (!result) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    // Test de création de session
    const session = await getServerSession(authOptions)
    console.log("🔍 Session après authorize:", session)

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: result.id,
        email: result.email,
        role: result.role
      },
      hasSession: !!session
    })

  } catch (error) {
    console.error("❌ Erreur test connexion:", error)
    return NextResponse.json(
      { 
        error: "Erreur lors du test de connexion",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
}
