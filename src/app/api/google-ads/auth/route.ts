import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { prisma } from "@/lib/db"

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  process.env.GOOGLE_ADS_REDIRECT_URI || "http://localhost:3000/api/google-ads/callback"
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { message: "Utilisateur non identifié" },
        { status: 400 }
      )
    }

    // Générer l&apos;URL d&apos;autorisation Google
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/adwords",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ],
      state: userId // Passer l&apos;ID utilisateur dans le state
    })

    return NextResponse.json({
      authUrl,
      message: "URL d&apos;autorisation générée"
    })

  } catch (error) {
    console.error("Erreur lors de la génération de l&apos;URL d&apos;autorisation:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 