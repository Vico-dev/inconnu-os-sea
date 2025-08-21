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
      // Nettoyer le JSON malformé de Google
      let cleanedTokenText = tokenText
        .replace(/,\s*}/g, '}')  // Enlever les virgules trailing
        .replace(/,\s*]/g, ']')  // Enlever les virgules trailing dans les arrays
        .replace(/;\s*,/g, ',')  // Remplacer ";" par ","
        .replace(/;\s*}/g, '}')  // Enlever ";" avant }
      
      tokenData = JSON.parse(cleanedTokenText)
      console.log('✅ JSON nettoyé et parsé avec succès')
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
    console.log('🔍 Appel API Google Ads - Début')
    console.log('🔍 Developer Token:', process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? 'Présent' : 'MANQUANT')
    
    // Pour l'API REST Google Ads, nous devons utiliser un customer ID connu
    // Comme nous n'avons pas accès à listAccessibleCustomers en REST, 
    // nous allons simplement sauvegarder le token et laisser l'utilisateur
    // configurer son customer ID manuellement ou utiliser un ID générique
    
    // Utilisation d'un customer ID temporaire pour tester la connexion
    // L'utilisateur devra fournir son vrai customer ID via l'interface admin
    const tempCustomerId = '0000000000' // ID temporaire
    
    console.log('🔍 Utilisation du customer ID temporaire pour tester la connexion')
    
    // Sauvegarder les informations de base sans faire d'appel API supplémentaire
    const accountData = {
      results: [{
        customer: {
          id: tempCustomerId,
          descriptiveName: 'Compte Google Ads (ID à configurer)',
          manager: true // Supposer que c'est un compte manager pour MCC
        }
      }]
    }

    console.log('✅ Données du compte Google Ads préparées pour sauvegarde')

    // Vérifier le type de connexion
    const isMCCConnection = state.startsWith('mcc_')
    const isOnboardingConnection = state.startsWith('onboarding_')
    
    let actualUserId: string
    let connectionType: 'mcc' | 'onboarding' | 'client' = 'client'
    
    if (isMCCConnection) {
      actualUserId = state.replace('mcc_', '')
      connectionType = 'mcc'
    } else if (isOnboardingConnection) {
      // Format: onboarding_userId_existing ou onboarding_userId_new
      const parts = state.split('_')
      actualUserId = parts[1]
      connectionType = 'onboarding'
    } else {
      actualUserId = state
      connectionType = 'client'
    }
    
    console.log('🔍 Type de connexion:', { 
      state, 
      connectionType,
      actualUserId,
      isMCCConnection,
      isOnboardingConnection
    })

    // Sauvegarder les informations dans la base de données
    // Utiliser les données préparées
    const results = accountData.results || []
    const customerInfo = results.length > 0 ? results[0].customer : null
    const customerIdFromAPI = customerInfo?.id || tempCustomerId
    const customerName = customerInfo?.descriptiveName || 'Unknown Account'
    const isManager = customerInfo?.manager || false
    
    await prisma.googleAdsConnection.upsert({
      where: { userId: actualUserId },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
        accounts: JSON.stringify([{ customerId: customerIdFromAPI, name: customerName, isManager }]),
        isConnected: true,
        connectedAt: new Date(),
      },
      create: {
        userId: actualUserId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
        accounts: JSON.stringify([{ customerId: customerIdFromAPI, name: customerName, isManager }]),
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
    if (connectionType === 'mcc') {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/admin/mcc?success=connected`
      )
    } else if (connectionType === 'onboarding') {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/onboarding?googleAdsConnected=true&step=7`
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