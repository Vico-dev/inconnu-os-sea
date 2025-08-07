const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie !');
    
    // Vérifier les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });
    
    console.log(`📊 ${users.length} utilisateurs trouvés :`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`);
    });
    
    // Vérifier les comptes clients
    const clientAccounts = await prisma.clientAccount.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    console.log(`\n👥 ${clientAccounts.length} comptes clients trouvés :`);
    clientAccounts.forEach(account => {
      console.log(`   - ${account.user.email} (${account.status})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 