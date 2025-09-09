// Script de test pour l'API GMC
const testGMCAPI = async () => {
  console.log('🧪 Test de l\'API GMC...\n');

  // Test 1: Vérification de la route
  try {
    console.log('1️⃣ Test de la route GET /api/gmc/export...');
    const response = await fetch('http://localhost:3000/api/gmc/export?merchantId=123456789');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Route GET fonctionne:', data);
    } else {
      console.log('⚠️ Route GET retourne une erreur:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Erreur route GET:', error.message);
  }

  // Test 2: Test avec des produits fictifs
  try {
    console.log('\n2️⃣ Test de la route POST /api/gmc/export...');
    
    const testProducts = [
      {
        id: 'test_1',
        title: 'T-shirt Premium en coton bio',
        body_html: '<p>T-shirt de haute qualité en coton bio, confortable et durable.</p>',
        vendor: 'Ma Marque',
        product_type: 'vêtements',
        tags: 'premium, bio, confortable',
        variants: [
          {
            price: '29.99',
            inventory_quantity: 50,
            barcode: '1234567890123',
            sku: 'TSH-001'
          }
        ],
        images: [
          { src: 'https://example.com/tshirt1.jpg' }
        ],
        handle: 't-shirt-premium-coton-bio'
      },
      {
        id: 'test_2',
        title: 'Sneakers Urban Style',
        body_html: '<p>Sneakers tendance pour un look urbain et moderne.</p>',
        vendor: 'Ma Marque',
        product_type: 'chaussures',
        tags: 'urbain, moderne, tendance',
        variants: [
          {
            price: '89.99',
            inventory_quantity: 25,
            barcode: '1234567890124',
            sku: 'SNK-001'
          }
        ],
        images: [
          { src: 'https://example.com/sneakers1.jpg' }
        ],
        handle: 'sneakers-urban-style'
      }
    ];

    const response = await fetch('http://localhost:3000/api/gmc/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products: testProducts,
        merchantId: '123456789'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Route POST fonctionne:', data);
    } else {
      const errorData = await response.json();
      console.log('⚠️ Route POST retourne une erreur:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ Erreur route POST:', error.message);
  }

  console.log('\n🏁 Test terminé !');
};

// Lancer le test
testGMCAPI().catch(console.error); 