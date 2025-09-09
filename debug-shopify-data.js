const fetch = require('node-fetch');

async function debugShopifyData() {
  console.log('🔍 Debug des données Shopify...\n');
  
  try {
    // Test de l'endpoint de produits avec un storeId fictif
    console.log('1. Test de l\'endpoint /api/shopify/products...');
    const productsResponse = await fetch('https://agence-inconnu.fr/api/shopify/products?storeId=test&limit=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Status:', productsResponse.status);
    const productsData = await productsResponse.text();
    console.log('Response:', productsData);
    
    // Test de l'endpoint d'analyse IA
    console.log('\n2. Test de l\'endpoint /api/shopify/ai-analysis...');
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

debugShopifyData(); 