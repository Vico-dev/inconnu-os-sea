const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@agence-inconnu.fr' }
    })

    if (existingUser) {
      console.log('✅ Utilisateur test existe déjà:', existingUser.email)
      return existingUser
    }

    // Créer un utilisateur de test
    const hashedPassword = await bcrypt.hash('test123', 10)
    
    const user = await prisma.user.create({
      data: {
        email: 'test@agence-inconnu.fr',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'CLIENT',
        emailVerified: true,
        clientAccount: {
          create: {
            companyName: 'Test Company',
            contactEmail: 'test@agence-inconnu.fr',
            phone: '+33123456789',
            address: '123 Test Street',
            city: 'Paris',
            postalCode: '75001',
            country: 'France'
          }
        }
      },
      include: {
        clientAccount: true
      }
    })

    console.log('✅ Utilisateur test créé:', user.email)
    console.log('📧 Email:', user.email)
    console.log('🔑 Mot de passe: test123')
    console.log('🏢 Société:', user.clientAccount?.companyName)
    
    return user
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()