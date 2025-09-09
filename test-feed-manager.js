const fetch = require('node-fetch');

async function testFeedManager() {
  console.log('🧪 Test des APIs Feed Manager...\n');
  
  try {
    // Test de l'API stores
    console.log('1. Test API /api/shopify/stores...');
    const storesResponse = await fetch('https://inconnu-os-sea-production.up.railway.app/api/shopify/stores');
    console.log('Status:', storesResponse.status);
    console.log('Headers:', storesResponse.headers.get('content-type'));
    
    if (storesResponse.ok) {
      const storesData = await storesResponse.json();
      console.log('✅ Stores API OK:', storesData);
    } else {
      const errorText = await storesResponse.text();
      console.log('❌ Stores API Error:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
  
  console.log('\n2. Test de la page feed-manager...');
  try {
    const pageResponse = await fetch('https://inconnu-os-sea-production.up.railway.app/client/feed-manager');
    console.log('Status:', pageResponse.status);
    console.log('Headers:', pageResponse.headers.get('content-type'));
    
    if (pageResponse.ok) {
      const pageText = await pageResponse.text();
      console.log('✅ Page accessible, longueur:', pageText.length);
      
      // Vérifier s'il y a des erreurs dans le HTML
      if (pageText.includes('Erreur lors de l\'analyse du contenu')) {
        console.log('⚠️  Erreurs détectées dans la page');
      }
    } else {
      console.log('❌ Page non accessible');
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test de la page:', error.message);
  }
}

testFeedManager(); 