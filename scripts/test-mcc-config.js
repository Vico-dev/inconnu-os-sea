#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration MCC
 */

require('dotenv').config({ path: '.env.local' })

console.log('🔍 Vérification de la configuration MCC...\n')

// Vérifier les variables d'environnement requises
const requiredEnvVars = [
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET', 
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_REDIRECT_URI'
]

console.log('📋 Variables d\'environnement:')
let allEnvVarsPresent = true

requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`)
  } else {
    console.log(`❌ ${varName}: MANQUANT`)
    allEnvVarsPresent = false
  }
})

console.log('\n🔗 URLs de test:')
console.log(`📍 Auth MCC: ${process.env.NEXTAUTH_URL}/api/admin/mcc/auth`)
console.log(`📍 Comptes MCC: ${process.env.NEXTAUTH_URL}/api/admin/mcc/accounts`)
console.log(`📍 Page MCC: ${process.env.NEXTAUTH_URL}/admin/mcc`)

console.log('\n📊 Base de données:')
console.log(`📍 URL: ${process.env.DATABASE_URL ? 'Configurée' : 'MANQUANT'}`)

if (allEnvVarsPresent) {
  console.log('\n✅ Configuration MCC complète!')
  console.log('🚀 Vous pouvez maintenant tester l\'interface MCC.')
} else {
  console.log('\n❌ Configuration MCC incomplète!')
  console.log('⚠️  Veuillez configurer toutes les variables d\'environnement requises.')
}

console.log('\n📝 Instructions de test:')
console.log('1. Connectez-vous en tant qu\'admin')
console.log('2. Allez sur /admin/mcc')
console.log('3. Cliquez sur "Se connecter à Google Ads"')
console.log('4. Autorisez l\'accès dans Google')
console.log('5. Vous serez redirigé vers la page MCC')
console.log('6. Testez la liaison/déliaison des comptes') 