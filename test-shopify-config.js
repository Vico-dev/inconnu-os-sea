const fetch = require('node-fetch');

async function testShopifyConfig() {
  console.log('🧪 Test de la configuration Shopify...\n');
  
  try {
    // Test 1: Vérifier l'endpoint d'authentification
    console.log('1. Test de l\'endpoint d\'authentification Shopify...');
    const authResponse = await fetch('https://inconnu-os-sea-production.up.railway.app/api/shopify/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop: 'test-boutique' })
    });
    
    console.log('Status:', authResponse.status);
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('✅ Auth endpoint OK:', authData);
    } else {
      const errorText = await authResponse.text();
      console.log('❌ Auth endpoint Error:', errorText);
    }
    
    // Test 2: Vérifier l'endpoint des stores
    console.log('\n2. Test de l\'endpoint des stores...');
    const storesResponse = await fetch('https://inconnu-os-sea-production.up.railway.app/api/shopify/stores');
    console.log('Status:', storesResponse.status);
    
    if (storesResponse.ok) {
      const storesData = await storesResponse.json();
      console.log('✅ Stores endpoint OK');
    } else {
      const errorText = await storesResponse.text();
      console.log('❌ Stores endpoint Error:', errorText);
    }
    
    // Test 3: Vérifier les variables d'environnement
    console.log('\n3. Test des variables d\'environnement...');
    const envTestResponse = await fetch('https://inconnu-os-sea-production.up.railway.app/api/debug/database');
    console.log('Status:', envTestResponse.status);
    
    if (envTestResponse.ok) {
      const envData = await envTestResponse.json();
      console.log('✅ Debug endpoint accessible');
      
      // Vérifier les variables Shopify
      const hasShopifyClientId = envData.environment?.SHOPIFY_CLIENT_ID ? '✅ Présent' : '❌ MANQUANT';
      const hasShopifySecret = envData.environment?.SHOPIFY_CLIENT_SECRET ? '✅ Présent' : '❌ MANQUANT';
      const hasShopifyRedirect = envData.environment?.SHOPIFY_REDIRECT_URI ? '✅ Présent' : '❌ MANQUANT';
      
      console.log('SHOPIFY_CLIENT_ID:', hasShopifyClientId);
      console.log('SHOPIFY_CLIENT_SECRET:', hasShopifySecret);
      console.log('SHOPIFY_REDIRECT_URI:', hasShopifyRedirect);
    } else {
      console.log('❌ Debug endpoint non accessible');
    }
    
    console.log('\n📋 Résumé :');
    console.log('- Si les variables Shopify sont MANQUANTES, il faut les ajouter dans Railway');
    console.log('- Si les endpoints retournent des erreurs, vérifier la configuration');
    console.log('- L\'app Shopify doit être reconfigurée dans le Partner Dashboard');
    
  } catch (error) {
    console.log('❌ Erreur lors des tests:', error.message);
  }
}

testShopifyConfig();
