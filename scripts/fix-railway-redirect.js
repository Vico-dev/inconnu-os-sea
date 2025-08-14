#!/usr/bin/env node

/**
 * Script pour corriger l'URL de redirection Railway
 */

console.log('🔧 Correction de l\'URL de redirection Railway...\n')

const railwayUrl = 'https://inconnu-os-sea.railway.app'

console.log('📋 Variables à configurer dans Railway:')
console.log('')
console.log('GOOGLE_ADS_REDIRECT_URI=' + railwayUrl + '/api/google-ads/callback')
console.log('NEXTAUTH_URL=' + railwayUrl)
console.log('')

console.log('📝 Instructions:')
console.log('1. Va dans Railway Dashboard')
console.log('2. Sélectionne ton projet inconnu-os-sea')
console.log('3. Va dans "Variables"')
console.log('4. Modifie ou ajoute:')
console.log('   - GOOGLE_ADS_REDIRECT_URI = ' + railwayUrl + '/api/google-ads/callback')
console.log('   - NEXTAUTH_URL = ' + railwayUrl)
console.log('5. Redéploie l\'application')
console.log('')

console.log('🔗 URLs importantes après correction:')
console.log('📍 Application: ' + railwayUrl)
console.log('📍 Admin MCC: ' + railwayUrl + '/admin/mcc')
console.log('📍 Callback: ' + railwayUrl + '/api/google-ads/callback')
console.log('')

console.log('⚠️  IMPORTANT:')
console.log('Tu dois aussi configurer cette URL dans Google Cloud Console:')
console.log('1. Va dans Google Cloud Console')
console.log('2. Sélectionne ton projet')
console.log('3. Va dans "APIs & Services" > "Credentials"')
console.log('4. Modifie ton OAuth 2.0 Client ID')
console.log('5. Ajoute cette URL autorisée: ' + railwayUrl + '/api/google-ads/callback') 