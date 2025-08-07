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
    const code = searchParams.get("code")
    const state = searchParams.get("state") // userId
    const error = searchParams.get("error")

    if (error) {
      console.error("Erreur d'autorisation Google:", error)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client?error=google_auth_failed`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client?error=missing_params`
      )
    }

    // Échanger le code contre des tokens
    const { tokens } = await oauth2Client.getToken(code)
    
    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client?error=no_access_token`
      )
    }

    // Récupérer les informations du compte Google Ads
    const googleAdsApi = google.ads({
      version: "v14",
      auth: oauth2Client
    })

    // Récupérer les comptes Google Ads accessibles
    const customerService = googleAdsApi.customers()
    const accounts = await customerService.list({
      auth: oauth2Client
    })

    // Sauvegarder les tokens et informations du compte
    await prisma.googleAdsConnection.upsert({
      where: {
        userId: state
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        accounts: JSON.stringify(accounts.data.results || []),
        isConnected: true,
        connectedAt: new Date()
      },
      create: {
        userId: state,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        accounts: JSON.stringify(accounts.data.results || []),
        isConnected: true,
        connectedAt: new Date()
      }
    })

    // Mettre à jour le statut dans le compte client
    await prisma.clientAccount.updateMany({
      where: {
        userId: state
      },
      data: {
        googleAdsConnected: true
      }
    })

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/client?success=google_ads_connected`
    )

  } catch (error) {
    console.error("Erreur lors du callback Google Ads:", error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/client?error=callback_failed`
    )
  }
} 