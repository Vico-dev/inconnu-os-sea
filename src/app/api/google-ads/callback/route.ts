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
    
    // Étape 1: Récupérer la liste des comptes accessibles
    const listCustomersResponse = await fetch('https://googleads.googleapis.com/v15/customers:listAccessibleCustomers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
    })

    console.log('🔍 Réponse listAccessibleCustomers - Status:', listCustomersResponse.status)
    console.log('🔍 Réponse listAccessibleCustomers - Headers:', Object.fromEntries(listCustomersResponse.headers.entries()))
    
    const listCustomersText = await listCustomersResponse.text()
    console.log('🔍 Réponse listAccessibleCustomers - Body:', listCustomersText.substring(0, 500))

    let listCustomersData
    try {
      listCustomersData = JSON.parse(listCustomersText)
      console.log('✅ listAccessibleCustomers - JSON parsé avec succès')
    } catch (parseError) {
      console.error('❌ Erreur parsing listAccessibleCustomers:', parseError)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?error=list_customers_failed`
      )
    }

    if (!listCustomersResponse.ok) {
      console.error('Erreur lors de la récupération des comptes:', listCustomersData)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?error=list_customers_failed`
      )
    }

    // Étape 2: Prendre le premier customer ID et récupérer ses détails
    const customerIds = listCustomersData.resourceNames || []
    if (customerIds.length === 0) {
      console.error('Aucun compte Google Ads accessible trouvé')
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?error=no_accounts_found`
      )
    }

    const firstCustomerResource = customerIds[0] // Format: customers/1234567890
    const customerId = firstCustomerResource.replace('customers/', '')
    
    console.log('🔍 Premier customer ID:', customerId)

    // Étape 3: Récupérer les détails du customer
    const accountResponse = await fetch(`https://googleads.googleapis.com/v15/customers/${customerId}/googleAds:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1"
      })
    })

    console.log('🔍 Réponse API Google Ads - Status:', accountResponse.status)
    console.log('🔍 Réponse API Google Ads - Headers:', Object.fromEntries(accountResponse.headers.entries()))
    
    const accountText = await accountResponse.text()
    console.log('🔍 Réponse API Google Ads - Body (premiers 500 chars):', accountText.substring(0, 500))
    
    let accountData
    try {
      accountData = JSON.parse(accountText)
      console.log('✅ API Google Ads - JSON parsé avec succès')
    } catch (parseError) {
      console.error('❌ Erreur parsing API Google Ads:', parseError)
      console.error('📋 Réponse complète API Google Ads:', accountText)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/client/google-ads?error=google_ads_api_failed`
      )
    }

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
    // L'API search retourne un tableau de résultats avec customer.id
    const results = accountData.results || []
    const customerInfo = results.length > 0 ? results[0].customer : null
    const customerIdFromAPI = customerInfo?.id || customerId // Utiliser l'ID de l'API ou celui récupéré plus tôt
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