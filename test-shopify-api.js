const fetch = require('node-fetch');

async function testShopifyAPI() {
  console.log('🧪 Test de l\'API Shopify en production...\n');
  
  try {
    // Test 1: Récupération des boutiques
    console.log('1️⃣ Test récupération des boutiques...');
    const storesResponse = await fetch('https://agence-inconnu.fr/api/shopify/stores');
    const storesData = await storesResponse.json();
    console.log('Boutiques:', storesData);
    
    if (storesData.stores && storesData.stores.length > 0) {
      const storeId = storesData.stores[0].id;
      console.log(`\n2️⃣ Test récupération des produits pour la boutique ${storeId}...`);
      
      // Test 2: Récupération des produits
      const productsResponse = await fetch(`https://agence-inconnu.fr/api/shopify/products?storeId=${storeId}&limit=5`);
      const productsData = await productsResponse.json();
      console.log('Produits:', productsData);
      
      if (productsData.products && productsData.products.length > 0) {
        console.log(`\n✅ SUCCÈS: ${productsData.products.length} produits trouvés`);
        console.log('Premier produit:', productsData.products[0]);
      } else {
        console.log('\n❌ AUCUN PRODUIT: La boutique n\'a pas de produits ou l\'API ne fonctionne pas');
      }
    } else {
      console.log('\n❌ AUCUNE BOUTIQUE: Aucune boutique connectée trouvée');
    }
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
  }
}

testShopifyAPI(); 