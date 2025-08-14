import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Callback Google Ads - Début')
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // ID de l'utilisateur ou "mcc_" + ID admin
    const error = searchParams.get('error')
    
    console.log('📋 Paramètres reçus:', { code: code ? 'présent' : 'manquant', state, error })

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?error=auth_failed`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?error=missing_params`
      )
    }

    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_ADS_REDIRECT_URI!,
      }),
    })

    console.log('🔍 Réponse Google OAuth - Status:', tokenResponse.status)
    console.log('🔍 Réponse Google OAuth - Headers:', Object.fromEntries(tokenResponse.headers.entries()))
    
    const tokenText = await tokenResponse.text()
    console.log('🔍 Réponse Google OAuth - Body (premiers 500 chars):', tokenText.substring(0, 500))
    
    let tokenData
    try {
      tokenData = JSON.parse(tokenText)
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError)
      console.error('📋 Réponse complète de Google:', tokenText)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?error=token_parse_failed`
      )
    }

    if (!tokenResponse.ok) {
      console.error('Erreur lors de l\'échange du token:', tokenData)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?error=token_exchange_failed`
      )
    }

    // Récupérer les informations du compte Google Ads
    const accountResponse = await fetch('https://googleads.googleapis.com/v14/customers', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
    })

    const accountData = await accountResponse.json()

    if (!accountResponse.ok) {
      console.error('Erreur lors de la récupération du compte:', accountData)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?error=account_fetch_failed`
      )
    }

    // Vérifier si c'est une connexion MCC (admin) ou client
    const isMCCConnection = state.startsWith('mcc_')
    const actualUserId = isMCCConnection ? state.replace('mcc_', '') : state
    
    console.log('🔍 Type de connexion:', { isMCCConnection, actualUserId })

    // Sauvegarder les informations dans la base de données
    await prisma.googleAdsConnection.upsert({
      where: { userId: actualUserId },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
        accounts: JSON.stringify(accountData.results || []),
        isConnected: true,
        connectedAt: new Date(),
      },
      create: {
        userId: actualUserId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
        accounts: JSON.stringify(accountData.results || []),
        isConnected: true,
        connectedAt: new Date(),
      }
    })

    // Mettre à jour le statut dans le compte client (seulement si ce n'est pas MCC)
    if (!isMCCConnection) {
      await prisma.clientAccount.updateMany({
        where: { userId: actualUserId },
        data: { googleAdsConnected: true }
      })
    }

    // Rediriger selon le type de connexion
    if (isMCCConnection) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/admin/mcc?success=connected`
      )
    } else {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?success=connected`
      )
    }

  } catch (error) {
    console.error('❌ Erreur lors du callback Google Ads:', error)
    console.error('📋 Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : 'Pas de stack trace',
      state: request.nextUrl.searchParams.get('state')
    })
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/client/google-ads?error=callback_failed`
    )
  }
} 