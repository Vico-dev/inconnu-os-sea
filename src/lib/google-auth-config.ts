import { google } from 'googleapis'

// Configuration des scopes nécessaires pour GMC
const SCOPES = [
  'https://www.googleapis.com/auth/content', // Accès complet à l'API Content
  'https://www.googleapis.com/auth/adwords', // Accès aux campagnes Google Ads
]

// Configuration de l'authentification Google
export function createGoogleAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Chemin vers le fichier de service
    scopes: SCOPES,
  })

  return auth
}

// Configuration spécifique pour GMC
export function createGMCClient() {
  const auth = createGoogleAuth()
  
  const contentAPI = google.content({
    version: 'v2.1',
    auth,
  })

  return contentAPI
}

// Configuration pour Google Ads API
export function createGoogleAdsClient() {
  const auth = createGoogleAuth()
  
  const googleAdsAPI = google.adwords({
    version: 'v201809',
    auth,
  })

  return googleAdsAPI
}

// Vérification de la configuration
export async function testGoogleAuth() {
  try {
    const auth = createGoogleAuth()
    const client = await auth.getClient()
    
    // Test avec l'API Content
    const contentAPI = google.content({
      version: 'v2.1',
      auth: client,
    })

    console.log('✅ Authentification Google configurée avec succès')
    return true
  } catch (error) {
    console.error('❌ Erreur configuration Google Auth:', error)
    return false
  }
} 