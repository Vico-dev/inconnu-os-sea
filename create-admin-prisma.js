// Script Prisma pour créer un administrateur de test
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👤 Création d\'un administrateur de test via Prisma...\n');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'victor@agence-inconnu.fr' }
    });

    if (existingUser) {
      console.log('✅ Utilisateur victor@agence-inconnu.fr existe déjà');
      console.log('🔑 Identifiants:');
      console.log('   Email: victor@agence-inconnu.fr');
      console.log('   Mot de passe: Test123!');
      console.log('   Rôle: ADMIN');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: 'victor@agence-inconnu.fr',
        password: hashedPassword,
        firstName: 'Victor',
        lastName: 'Soldet',
        role: 'ADMIN',
        emailVerified: true
      }
    });

    console.log('✅ Administrateur créé avec succès:', user);
    console.log('\n🔑 Identifiants de test:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Mot de passe: Test123!`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   ID: ${user.id}`);

  } catch (error) {
    console.error('❌ Erreur création utilisateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Lancer la création
createAdminUser(); 