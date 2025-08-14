#!/usr/bin/env node

/**
 * Script de diagnostic pour les problèmes MCC
 */

require('dotenv').config({ path: '.env.local' })

console.log('🔍 Diagnostic MCC Google Ads...\n')

// Vérifier les variables d'environnement
console.log('📋 Variables d\'environnement:')
const requiredVars = [
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET', 
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_REDIRECT_URI',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
]

let missingVars = []
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 15)}...`)
  } else {
    console.log(`❌ ${varName}: MANQUANT`)
    missingVars.push(varName)
  }
})

// Vérifier l'URL de redirection
const redirectUri = process.env.GOOGLE_ADS_REDIRECT_URI
if (redirectUri) {
  console.log(`\n🔗 URL de redirection: ${redirectUri}`)
  
  // Vérifier si l'URL correspond à l'environnement
  if (redirectUri.includes('localhost')) {
    console.log('⚠️  URL de redirection pointe vers localhost - vérifiez pour la production')
  } else if (redirectUri.includes('railway.app')) {
    console.log('✅ URL de redirection configurée pour Railway')
  }
}

// Vérifier les endpoints
console.log('\n🔗 Endpoints à tester:')
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
console.log(`📍 Auth MCC: ${baseUrl}/api/admin/mcc/auth`)
console.log(`📍 Callback: ${baseUrl}/api/google-ads/callback`)
console.log(`📍 Comptes: ${baseUrl}/api/admin/mcc/accounts`)

// Problèmes courants
console.log('\n🚨 Problèmes courants MCC:')
console.log('1. URL de redirection non configurée dans Google Cloud Console')
console.log('2. Developer Token non approuvé')
console.log('3. Scope OAuth insuffisant')
console.log('4. Compte Google Ads non configuré comme MCC')
console.log('5. Variables d\'environnement manquantes en production')

if (missingVars.length > 0) {
  console.log(`\n❌ Variables manquantes: ${missingVars.join(', ')}`)
  console.log('⚠️  Configurez ces variables dans Railway')
} else {
  console.log('\n✅ Toutes les variables sont configurées')
}

console.log('\n📝 Instructions de débogage:')
console.log('1. Vérifiez les logs Railway: railway logs')
console.log('2. Testez l\'endpoint auth: curl ' + baseUrl + '/api/admin/mcc/auth')
console.log('3. Vérifiez la console Google Cloud')
console.log('4. Testez avec un compte Google Ads valide') 