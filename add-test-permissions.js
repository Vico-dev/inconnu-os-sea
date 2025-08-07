const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestPermissions() {
  try {
    console.log('🔐 Ajout des permissions de test...');

    // Récupérer les comptes clients existants
    const clientAccounts = await prisma.clientAccount.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        company: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`📊 ${clientAccounts.length} comptes clients trouvés`);

    // Ajouter des permissions de test pour chaque client
    for (const clientAccount of clientAccounts) {
      // Simuler des IDs de comptes Google Ads (en production, ce sera les vrais IDs)
      const googleAdsCustomerIds = [
        `1234567890-${clientAccount.id.slice(-4)}`,
        `9876543210-${clientAccount.id.slice(-4)}`
      ];

      for (const customerId of googleAdsCustomerIds) {
        await prisma.googleAdsPermission.upsert({
          where: {
            clientAccountId_googleAdsCustomerId: {
              clientAccountId: clientAccount.id,
              googleAdsCustomerId: customerId
            }
          },
          update: {
            permissions: JSON.stringify({
              read: true,
              write: false,
              admin: false
            }),
            isActive: true,
            updatedAt: new Date()
          },
          create: {
            clientAccountId: clientAccount.id,
            userId: clientAccount.userId,
            googleAdsCustomerId: customerId,
            permissions: JSON.stringify({
              read: true,
              write: false,
              admin: false
            }),
            isActive: true
          }
        });

        console.log(`✅ Permission ajoutée pour ${clientAccount.user.firstName} ${clientAccount.user.lastName} - ${customerId}`);
      }
    }

    console.log('🎉 Permissions de test ajoutées avec succès !');
    console.log('\n📋 Résumé :');
    console.log(`   - ${clientAccounts.length} comptes clients configurés`);
    console.log(`   - ${clientAccounts.length * 2} permissions créées`);
    console.log('   - Chaque client a accès à 2 comptes Google Ads simulés');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestPermissions(); 