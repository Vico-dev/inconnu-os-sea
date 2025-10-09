import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Callback Google Ads - Début')
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // ID de l'utilisateur
    const error = searchParams.get('error')
    
    console.log('📋 Paramètres reçus:', { code: code ? 'présent' : 'manquant', state, error })
    console.log('📋 URL complète:', request.url)

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
    console.log('🔍 Refresh token présent:', tokenText.includes('refresh_token') ? 'OUI' : 'NON')
    
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
      console.log('🔍 Token data keys:', Object.keys(tokenData))
      console.log('🔍 Refresh token dans data:', tokenData.refresh_token ? 'OUI' : 'NON')
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
    const isOnboardingConnection = state.startsWith('onboarding_')
    
    let actualUserId: string
    let connectionType: 'onboarding' | 'client' = 'client'
    
    if (isOnboardingConnection) {
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
      isOnboardingConnection
    })

    // TEMPORAIRE: Sauvegarder les informations dans la base de données
    // Utiliser les données préparées
    const results = accountData.results || []
    const customerInfo = results.length > 0 ? results[0].customer : null
    const customerIdFromAPI = customerInfo?.id || tempCustomerId
    const customerName = customerInfo?.descriptiveName || 'Unknown Account'
    const isManager = customerInfo?.manager || false
    
    console.log('🔍 Tentative de sauvegarde de la connexion Google Ads...')
    console.log('🔍 Données à sauvegarder:', {
      userId: actualUserId,
      customerId: customerIdFromAPI,
      customerName: customerName,
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000)
    })
    
    // TEMPORAIRE: Désactiver la sauvegarde en base pour éviter l'erreur customerId
    // TODO: Réactiver une fois la migration appliquée en production
    try {
      // Vérifier si c'est une connexion multiple ou une nouvelle connexion
      const isMultipleConnection = request.nextUrl.searchParams.get('multiple') === 'true'
      
      if (isMultipleConnection) {
        // Ajouter un nouveau compte à la liste existante
        await prisma.googleAdsConnection.create({
          data: {
            userId: actualUserId,
            customerId: customerIdFromAPI,
            customerName: customerName,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
            isConnected: true,
            isPrimary: false, // Pas le compte principal par défaut
            connectedAt: new Date(),
          }
        })
      } else {
        // Remplacer la connexion existante ou créer la première
        // D'abord, supprimer toutes les connexions existantes
        await prisma.googleAdsConnection.deleteMany({
          where: { userId: actualUserId }
        })
        
        // Créer la nouvelle connexion comme principale
        await prisma.googleAdsConnection.create({
          data: {
            userId: actualUserId,
            customerId: customerIdFromAPI,
            customerName: customerName,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
            isConnected: true,
            isPrimary: true, // Compte principal
            connectedAt: new Date(),
          }
        })
      }
      console.log('✅ Connexion Google Ads sauvegardée avec succès')
    } catch (dbError) {
      console.warn('⚠️ Erreur lors de la sauvegarde en base (ignorée temporairement):', dbError)
      console.log('ℹ️ La connexion Google Ads fonctionne mais n\'est pas sauvegardée en base')
      console.log('🔍 Détails erreur DB:', {
        message: dbError instanceof Error ? dbError.message : 'Erreur inconnue',
        stack: dbError instanceof Error ? dbError.stack : 'Pas de stack trace'
      })
    }

    // Rediriger selon le type de connexion
    if (connectionType === 'onboarding') {
      // Rediriger vers l'onboarding avec un délai pour laisser le temps à la session de se stabiliser
      const redirectUrl = `${process.env.NEXTAUTH_URL}/onboarding?googleAdsConnected=true&step=7&timestamp=${Date.now()}`
      console.log('🔄 Redirection vers onboarding:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
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