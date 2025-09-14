#!/usr/bin/env node

/**
 * Script pour configurer les variables Shopify dans Railway
 * 
 * Instructions :
 * 1. Installer Railway CLI : npm install -g @railway/cli
 * 2. Se connecter : railway login
 * 3. Exécuter : node configure-shopify-vars.js
 */

const { execSync } = require('child_process');

const SHOPIFY_VARS = {
  SHOPIFY_CLIENT_ID: '757a707695544d8f0c88217b025553f5',
  SHOPIFY_CLIENT_SECRET: 'd2acf3d815393acf68df5fab598699df',
  SHOPIFY_REDIRECT_URI: 'https://inconnu-os-sea-production.up.railway.app/api/shopify/callback',
  SHOPIFY_SCOPES: 'read_products,read_inventory,read_orders'
};

console.log('🚀 Configuration des variables Shopify dans Railway...\n');

try {
  // Vérifier si Railway CLI est installé
  try {
    execSync('railway --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('❌ Railway CLI non installé. Installez-le avec :');
    console.log('   npm install -g @railway/cli');
    console.log('   railway login');
    process.exit(1);
  }

  // Ajouter chaque variable
  for (const [key, value] of Object.entries(SHOPIFY_VARS)) {
    try {
      console.log(`📝 Ajout de ${key}...`);
      execSync(`railway variables set ${key}="${value}"`, { stdio: 'pipe' });
      console.log(`✅ ${key} ajouté`);
    } catch (error) {
      console.log(`❌ Erreur pour ${key}:`, error.message);
    }
  }

  console.log('\n🎉 Configuration terminée !');
  console.log('⏳ Attendez 2-3 minutes que Railway redéploie...');
  console.log('🧪 Puis testez avec : node test-shopify-config.js');

} catch (error) {
  console.log('❌ Erreur générale:', error.message);
  console.log('\n📋 Configuration manuelle :');
  console.log('1. Aller sur https://railway.app/');
  console.log('2. Sélectionner le projet inconnu-os-sea');
  console.log('3. Onglet "Variables"');
  console.log('4. Ajouter ces variables :');
  
  for (const [key, value] of Object.entries(SHOPIFY_VARS)) {
    console.log(`   ${key}=${value}`);
  }
}
