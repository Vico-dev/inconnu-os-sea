const fetch = require('node-fetch');

async function testShopifyIntegration() {
  console.log('🧪 Test complet de l\'intégration Shopify...\n');
  
  try {
    // 1. Test de l'endpoint de base
    console.log('1. Test de l\'endpoint /api/shopify/stores...');
    const storesResponse = await fetch('https://agence-inconnu.fr/api/shopify/stores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Status:', storesResponse.status);
    const storesData = await storesResponse.text();
    console.log('Response:', storesData);
    
    // 2. Test de l'endpoint d'authentification
    console.log('\n2. Test de l\'endpoint /api/shopify/auth...');
    const authResponse = await fetch('https://agence-inconnu.fr/api/shopify/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shop: 'test-shop' })
    });
    
    console.log('Status:', authResponse.status);
    const authData = await authResponse.text();
    console.log('Response:', authData);
    
    // 3. Test de l'endpoint de callback
    console.log('\n3. Test de l\'endpoint /api/shopify/callback...');
    const callbackResponse = await fetch('https://agence-inconnu.fr/api/shopify/callback?shop=test&code=test&state=test', {
      method: 'GET'
    });
    
    console.log('Status:', callbackResponse.status);
    const callbackData = await callbackResponse.text();
    console.log('Response length:', callbackData.length);
    
    // 4. Test de l'endpoint de produits
    console.log('\n4. Test de l\'endpoint /api/shopify/products...');
    const productsResponse = await fetch('https://agence-inconnu.fr/api/shopify/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Status:', productsResponse.status);
    const productsData = await productsResponse.text();
    console.log('Response:', productsData);
    
    // 5. Test de l'endpoint d'analyse IA
    console.log('\n5. Test de l\'endpoint /api/shopify/ai-analysis...');
    const aiResponse = await fetch('https://agence-inconnu.fr/api/shopify/ai-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        productId: 'test', 
        storeId: 'test', 
        analysisType: 'content' 
      })
    });
    
    console.log('Status:', aiResponse.status);
    const aiData = await aiResponse.text();
    console.log('Response:', aiData);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testShopifyIntegration(); 