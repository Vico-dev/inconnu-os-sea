// Script Prisma pour créer un administrateur de test
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👤 Création d\'un administrateur de test via Prisma...\n');

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@test.local' }
    });

    if (existingUser) {
      console.log('✅ Utilisateur admin@test.local existe déjà');
      console.log('🔑 Identifiants de test:');
      console.log('   Email: admin@test.local');
      console.log('   Mot de passe: Test123!');
      console.log('   Rôle: ADMIN');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.local',
        password: hashedPassword,
        name: 'Admin Test',
        role: 'ADMIN',
        emailVerified: new Date(),
        isActive: true
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