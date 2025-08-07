const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🔐 Création des utilisateurs de test...');

    // Hash du mot de passe de test
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Créer un utilisateur client
    const clientUser = await prisma.user.upsert({
      where: { email: 'client@test.com' },
      update: {},
      create: {
        firstName: 'Test',
        lastName: 'Client',
        email: 'client@test.com',
        password: hashedPassword,
        role: 'CLIENT',
        company: 'Test Company',
        phone: '+33 6 12 34 56 78'
      }
    });

    // Créer une entreprise
    const company = await prisma.company.upsert({
      where: { id: 'test-company' },
      update: {},
      create: {
        id: 'test-company',
        name: 'Test Company',
        website: 'https://test-company.fr',
        industry: 'Technology',
        teamSize: '5-10',
        goals: JSON.stringify(['Augmenter les conversions']),
        currentChallenges: 'Optimisation des campagnes'
      }
    });

    // Créer un compte client
    const clientAccount = await prisma.clientAccount.upsert({
      where: { id: 'test-client-account' },
      update: {},
      create: {
        id: 'test-client-account',
        userId: clientUser.id,
        companyId: company.id,
        status: 'ACTIVE',
        onboardingCompleted: true,
        monthlyBudget: 1000,
        googleAdsConnected: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Créer un utilisateur Account Manager
    const amUser = await prisma.user.upsert({
      where: { email: 'am@test.com' },
      update: {},
      create: {
        firstName: 'Test',
        lastName: 'AM',
        email: 'am@test.com',
        password: hashedPassword,
        role: 'ACCOUNT_MANAGER',
        company: 'Agence Inconnu',
        phone: '+33 1 23 45 67 89'
      }
    });

    // Créer un Account Manager
    const accountManager = await prisma.accountManager.upsert({
      where: { id: 'test-am' },
      update: {},
      create: {
        id: 'test-am',
        userId: amUser.id,
        companyId: null
      }
    });

    // Créer un utilisateur admin
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        company: 'Agence Inconnu',
        phone: '+33 1 98 76 54 32'
      }
    });

    console.log('✅ Utilisateurs de test créés avec succès !');
    console.log('📧 Emails de test :');
    console.log('   - client@test.com (mot de passe: password123)');
    console.log('   - am@test.com (mot de passe: password123)');
    console.log('   - admin@test.com (mot de passe: password123)');

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers(); 