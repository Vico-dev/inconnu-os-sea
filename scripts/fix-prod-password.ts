import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixProdPassword() {
  try {
    console.log('🔧 Correction du mot de passe admin en PRODUCTION...')
    
    const adminEmail = 'victor@agence-inconnu.fr'
    const newPassword = 'admin123'
    
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (!existingUser) {
      console.log('❌ Utilisateur admin non trouvé, création...')
      
      // Créer la company si elle n'existe pas
      let company = await prisma.company.findFirst({
        where: { name: 'Agence Inconnu' }
      })
      
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: 'Agence Inconnu',
            website: 'https://agence-inconnu.fr',
            industry: 'Marketing Digital',
            teamSize: '1-5',
            goals: JSON.stringify(['Développement SEA', 'Optimisation Google Ads']),
            currentChallenges: 'Gestion des clients et optimisation des campagnes'
          }
        })
        console.log('✅ Company créée')
      }
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      // Créer l'utilisateur admin
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          firstName: 'Victor',
          lastName: 'Soldet',
          password: hashedPassword,
          role: 'ADMIN',
          company: 'Agence Inconnu'
        }
      })
      
      // Créer le compte client
      await prisma.clientAccount.create({
        data: {
          userId: adminUser.id,
          companyId: company.id,
          subscriptionPlan: null,
          monthlyBudget: null,
          onboardingCompleted: false,
          googleAdsConnected: false,
          status: 'ACTIVE',
          cgvAccepted: false,
          cgvAcceptedAt: null,
          cgvVersion: null
        }
      })
      
      console.log('✅ Compte admin créé en production!')
      console.log('📧 Email:', adminUser.email)
      console.log('🔑 Mot de passe:', newPassword)
      
    } else {
      console.log('✅ Utilisateur admin trouvé, mise à jour du mot de passe...')
      
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      // Mettre à jour l'utilisateur admin
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword
        }
      })
      
      console.log('✅ Mot de passe admin corrigé en production!')
      console.log('📧 Email:', updatedUser.email)
      console.log('🔑 Nouveau mot de passe:', newPassword)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProdPassword() 