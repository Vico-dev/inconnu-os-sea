#!/usr/bin/env node

/**
 * Script de diagnostic du callback OAuth
 */

require('dotenv').config({ path: '.env.local' })

console.log('🔍 Diagnostic du callback OAuth...\n')

const productionUrl = 'https://inconnu-os-sea-production.up.railway.app'

console.log('📋 Configuration actuelle:')
console.log('')
console.log('GOOGLE_ADS_REDIRECT_URI=' + process.env.GOOGLE_ADS_REDIRECT_URI)
console.log('NEXTAUTH_URL=' + process.env.NEXTAUTH_URL)
console.log('')

console.log('🔗 URLs importantes:')
console.log('📍 Callback URL: ' + productionUrl + '/api/google-ads/callback')
console.log('📍 Client page: ' + productionUrl + '/client/google-ads')
console.log('📍 Admin MCC: ' + productionUrl + '/admin/mcc')
console.log('')

console.log('🚨 Problème identifié:')
console.log('Le callback redirige vers /client/google-ads au lieu de /admin/mcc')
console.log('')

console.log('📝 Instructions de correction:')
console.log('')
console.log('1. Va dans Google Cloud Console:')
console.log('   https://console.cloud.google.com/apis/credentials')
console.log('')
console.log('2. Sélectionne ton projet')
console.log('')
console.log('3. Modifie ton OAuth 2.0 Client ID')
console.log('')
console.log('4. Dans "Authorized redirect URIs", ajoute:')
console.log('   ' + productionUrl + '/api/google-ads/callback')
console.log('')
console.log('5. Sauvegarde les modifications')
console.log('')
console.log('6. Teste à nouveau la connexion MCC')
console.log('')

console.log('🔍 Vérification des variables Railway:')
console.log('Assure-toi que ces variables sont configurées dans Railway:')
console.log('')
console.log('GOOGLE_ADS_REDIRECT_URI=' + productionUrl + '/api/google-ads/callback')
console.log('NEXTAUTH_URL=' + productionUrl)
console.log('')

console.log('⚠️  IMPORTANT:')
console.log('L\'URL de redirection doit être EXACTEMENT la même dans:')
console.log('- Google Cloud Console')
console.log('- Variables Railway')
console.log('- Code de l\'application') 