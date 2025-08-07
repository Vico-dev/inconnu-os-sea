import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer des utilisateurs AM
  const amUser1 = await prisma.user.upsert({
    where: { email: 'marie.dubois@agence-inconnu.fr' },
    update: {},
    create: {
      id: 'am-user-1',
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie.dubois@agence-inconnu.fr',
      password: '$2a$10$example', // Mot de passe hashé
      role: 'ACCOUNT_MANAGER',
      company: 'Agence Inconnu',
      phone: '+33 1 23 45 67 89'
    }
  })

  const amUser2 = await prisma.user.upsert({
    where: { email: 'thomas.martin@agence-inconnu.fr' },
    update: {},
    create: {
      id: 'am-user-2',
      firstName: 'Thomas',
      lastName: 'Martin',
      email: 'thomas.martin@agence-inconnu.fr',
      password: '$2a$10$example', // Mot de passe hashé
      role: 'ACCOUNT_MANAGER',
      company: 'Agence Inconnu',
      phone: '+33 1 98 76 54 32'
    }
  })

  // Créer des Account Managers
  const am1 = await prisma.accountManager.upsert({
    where: { id: 'am-1' },
    update: {},
    create: {
      id: 'am-1',
      userId: amUser1.id,
      companyId: null // AM général, non assigné à une entreprise spécifique
    }
  })

  const am2 = await prisma.accountManager.upsert({
    where: { id: 'am-2' },
    update: {},
    create: {
      id: 'am-2',
      userId: amUser2.id,
      companyId: null // AM général, non assigné à une entreprise spécifique
    }
  })

  // Créer des utilisateurs clients
  const user1 = await prisma.user.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      id: 'client-user-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'client1@example.com',
      password: '$2a$10$example', // Mot de passe hashé
      role: 'CLIENT',
      company: 'TechCorp',
      phone: '+33 6 12 34 56 78'
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'client2@example.com' },
    update: {},
    create: {
      id: 'client-user-2',
      firstName: 'Sophie',
      lastName: 'Bernard',
      email: 'client2@example.com',
      password: '$2a$10$example', // Mot de passe hashé
      role: 'CLIENT',
      company: 'EcoShop',
      phone: '+33 6 98 76 54 32'
    }
  })

  // Créer des entreprises
  const company1 = await prisma.company.upsert({
    where: { id: 'company-1' },
    update: {},
    create: {
      id: 'company-1',
      name: 'TechCorp',
      website: 'https://techcorp.fr',
      industry: 'Technology',
      teamSize: '10-50',
      goals: JSON.stringify(['Augmenter les conversions', 'Optimiser le ROAS']),
      currentChallenges: 'Difficulté à optimiser les campagnes'
    }
  })

  const company2 = await prisma.company.upsert({
    where: { id: 'company-2' },
    update: {},
    create: {
      id: 'company-2',
      name: 'EcoShop',
      website: 'https://ecoshop.fr',
      industry: 'E-commerce',
      teamSize: '5-10',
      goals: JSON.stringify(['Augmenter le trafic', 'Améliorer le CTR']),
      currentChallenges: 'Budget limité pour les tests'
    }
  })

  // Créer des comptes clients
  const clientAccount1 = await prisma.clientAccount.upsert({
    where: { id: 'client-account-1' },
    update: {},
    create: {
      id: 'client-account-1',
      userId: user1.id,
      companyId: company1.id,
      status: 'ACTIVE',
      onboardingCompleted: true,
      monthlyBudget: 2000,
      googleAdsConnected: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const clientAccount2 = await prisma.clientAccount.upsert({
    where: { id: 'client-account-2' },
    update: {},
    create: {
      id: 'client-account-2',
      userId: user2.id,
      companyId: company2.id,
      status: 'ACTIVE',
      onboardingCompleted: true,
      monthlyBudget: 1500,
      googleAdsConnected: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Créer des abonnements
  await prisma.subscription.upsert({
    where: { id: 'sub-1' },
    update: {},
    create: {
      id: 'sub-1',
      clientAccountId: clientAccount1.id,
      plan: 'PRO',
      status: 'ACTIVE',
      amount: 199,
      currency: 'EUR',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  await prisma.subscription.upsert({
    where: { id: 'sub-2' },
    update: {},
    create: {
      id: 'sub-2',
      clientAccountId: clientAccount2.id,
      plan: 'BASIC',
      status: 'ACTIVE',
      amount: 99,
      currency: 'EUR',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Créer des tickets de test
  await prisma.ticket.upsert({
    where: { id: 'ticket-1' },
    update: {},
    create: {
      id: 'ticket-1',
      clientAccountId: clientAccount1.id,
      accountManagerId: am1.id,
      subject: 'Problème avec ma campagne Google Ads',
      description: 'Ma campagne ne génère plus de conversions depuis hier. Pouvez-vous vérifier ?',
      status: 'OPEN',
      priority: 'HIGH',
      category: 'technical',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  await prisma.ticket.upsert({
    where: { id: 'ticket-2' },
    update: {},
    create: {
      id: 'ticket-2',
      clientAccountId: clientAccount2.id,
      accountManagerId: am2.id,
      subject: 'Demande d\'optimisation de budget',
      description: 'Je souhaite augmenter mon budget de 20% pour la prochaine période.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      category: 'optimization',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // -2 jours
      updatedAt: new Date()
    }
  })

  await prisma.ticket.upsert({
    where: { id: 'ticket-3' },
    update: {},
    create: {
      id: 'ticket-3',
      clientAccountId: clientAccount1.id,
      accountManagerId: am1.id,
      subject: 'Question sur les rapports',
      description: 'Comment interpréter les métriques de ROAS dans mes rapports ?',
      status: 'RESOLVED',
      priority: 'LOW',
      category: 'account',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // -5 jours
      updatedAt: new Date()
    }
  })

  console.log('✅ Seeding terminé avec succès !')
  console.log('📊 Données créées :')
  console.log(`   - ${2} Account Managers`)
  console.log(`   - ${2} Utilisateurs clients`)
  console.log(`   - ${2} Entreprises`)
  console.log(`   - ${2} Comptes clients`)
  console.log(`   - ${2} Abonnements`)
  console.log(`   - ${3} Tickets`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 