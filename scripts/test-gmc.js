#!/usr/bin/env node

/**
 * Script de test pour Google Merchant Center
 * Usage: node scripts/test-gmc.js
 */

const { testGoogleAuth } = require('../src/lib/google-auth-config')
const { gmcService } = require('../src/lib/gmc-service')

async function testGMCConnection() {
  console.log('🧪 Test de connexion Google Merchant Center...\n')

  try {
    // Test 1: Authentification Google
    console.log('1️⃣ Test d\'authentification Google...')
    const authResult = await testGoogleAuth()
    
    if (authResult) {
      console.log('✅ Authentification Google réussie\n')
    } else {
      console.log('❌ Échec de l\'authentification Google\n')
      return
    }

    // Test 2: Récupération des comptes GMC
    console.log('2️⃣ Test de récupération des comptes GMC...')
    const accounts = await gmcService.getAccounts()
    
    if (accounts && accounts.length > 0) {
      console.log(`✅ ${accounts.length} compte(s) GMC trouvé(s)`)
      
      for (const account of accounts) {
        console.log(`   📊 ${account.name} (${account.website_url})`)
        console.log(`   📦 ${account.feeds.length} feed(s)`)
        
        for (const feed of account.feeds) {
          console.log(`      - ${feed.name} (${feed.id})`)
        }
      }
      console.log('')
    } else {
      console.log('⚠️  Aucun compte GMC trouvé\n')
    }

    // Test 3: Test de connexion spécifique
    console.log('3️⃣ Test de connexion spécifique...')
    if (accounts && accounts.length > 0) {
      const firstAccount = accounts[0]
      const connectionResult = await gmcService.testConnection(firstAccount.id)
      
      if (connectionResult) {
        console.log(`✅ Connexion réussie au compte: ${firstAccount.name}\n`)
      } else {
        console.log(`❌ Échec de connexion au compte: ${firstAccount.name}\n`)
      }
    }

    console.log('🎉 Tests terminés avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message)
    console.error('')
    console.error('🔧 Vérifiez votre configuration:')
    console.error('   - Variables d\'environnement')
    console.error('   - Fichier de service Google')
    console.error('   - Permissions du compte de service')
    console.error('   - APIs activées dans Google Cloud Console')
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  testGMCConnection()
}

module.exports = { testGMCConnection } 