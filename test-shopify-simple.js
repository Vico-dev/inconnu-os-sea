const fetch = require('node-fetch');

async function testShopifySimple() {
  console.log('🧪 Test simple de la configuration Shopify...\n');
  
  try {
    // Test 1: Vérifier l'endpoint d'authentification
    console.log('1. Test de l\'endpoint d\'authentification...');
    const authResponse = await fetch('https://agence-inconnu.fr/api/shopify/auth', {
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
    
    // Test 2: Vérifier l'URL de redirection
    console.log('\n2. Test de l\'URL de redirection...');
    const redirectUrl = 'https://agence-inconnu.fr/api/shopify/callback';
    console.log('URL de redirection configurée:', redirectUrl);
    
    // Test 3: Vérifier l'URL d'authentification générée
    console.log('\n3. Test de l\'URL d\'authentification...');
    const shop = 'test-boutique';
    const clientId = '757a707695544d8f0c88217b025553f5';
    const redirectUri = 'https://agence-inconnu.fr/api/shopify/callback';
    const scopes = 'read_products,read_inventory,read_orders';
    
    const authUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${Date.now()}`;
    
    console.log('URL d\'authentification générée:');
    console.log(authUrl);
    
    console.log('\n📋 Instructions :');
    console.log('1. Copiez l\'URL d\'authentification ci-dessus');
    console.log('2. Ouvrez-la dans un navigateur');
    console.log('3. Vérifiez si l\'erreur "redirect_uri not whitelisted" persiste');
    
  } catch (error) {
    console.log('❌ Erreur lors des tests:', error.message);
  }
}

testShopifySimple();
