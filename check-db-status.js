const { PrismaClient } = require('@prisma/client');

async function checkDatabaseStatus() {
  console.log('🔍 Vérification de l\'état de la base de données...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Test de connexion
    console.log('1. Test de connexion à la base...');
    await prisma.$connect();
    console.log('✅ Connexion réussie\n');
    
    // Vérifier les tables existantes
    console.log('2. Vérification des tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Tables trouvées:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Vérifier spécifiquement shopify_stores
    console.log('\n3. Vérification de la table shopify_stores...');
    const shopifyStoresExists = tables.some(t => t.table_name === 'shopify_stores');
    
    if (shopifyStoresExists) {
      console.log('✅ Table shopify_stores existe');
      
      // Compter les stores
      const storeCount = await prisma.shopifyStore.count();
      console.log(`📊 Nombre de stores: ${storeCount}`);
      
      if (storeCount > 0) {
        const stores = await prisma.shopifyStore.findMany({
          take: 3,
          select: { id: true, name: true, domain: true, userId: true }
        });
        console.log('Stores trouvés:', stores);
      }
    } else {
      console.log('❌ Table shopify_stores N\'EXISTE PAS');
      console.log('💡 Il faut appliquer la migration en production');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    if (error.message.includes('relation "shopify_stores" does not exist')) {
      console.log('\n💡 SOLUTION: La table shopify_stores n\'existe pas');
      console.log('   Il faut appliquer la migration en production avec:');
      console.log('   railway up');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus(); 