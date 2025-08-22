import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Création du compte Admin...')
    
    // Créer l'utilisateur Admin
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@agence-inconnu.fr',
        firstName: 'Admin',
        lastName: 'Inconnu',
        password: hashedPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Utilisateur Admin créé:', user.id)
    
    // Créer quelques données de test pour l'admin
    const testClients = [
      {
        email: 'client-admin1@test.com',
        name: 'Client Admin Test 1',
        companyName: 'Entreprise Admin Test 1',
        website: 'https://admin-test1.com',
        industry: 'E-commerce'
      },
      {
        email: 'client-admin2@test.com',
        name: 'Client Admin Test 2',
        companyName: 'Entreprise Admin Test 2',
        website: 'https://admin-test2.com',
        industry: 'SaaS'
      }
    ]
    
    const createdClients = []
    
    for (const clientData of testClients) {
      // Créer l'utilisateur client
      const clientUser = await prisma.user.create({
        data: {
          email: clientData.email,
          firstName: clientData.name.split(' ')[0] || 'Client',
          lastName: clientData.name.split(' ').slice(1).join(' ') || 'Test',
          password: hashedPassword,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          role: 'CLIENT'
        }
      })
      
      // Créer l'entreprise client
      const clientCompany = await prisma.company.create({
        data: {
          name: clientData.companyName,
          website: clientData.website,
          industry: clientData.industry,
          teamSize: '5-10'
        }
      })
      
      // Créer le compte client
      const clientAccount = await prisma.clientAccount.create({
        data: {
          userId: clientUser.id,
          companyId: clientCompany.id,
          subscriptionPlan: 'MEDIUM_BUDGET',
          monthlyBudget: 3000,
          onboardingCompleted: true,
          googleAdsConnected: true,
          status: 'ACTIVE'
        }
      })
      
      createdClients.push({
        name: clientData.name,
        id: clientAccount.id,
        email: clientData.email
      })
      
      console.log(`✅ Client créé: ${clientData.name} (${clientAccount.id})`)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Compte Admin créé avec succès',
      data: {
        admin: {
          id: user.id,
          email: 'admin@agence-inconnu.fr',
          password: 'admin123'
        },
        clients: createdClients
      }
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
    return NextResponse.json({
      error: "Erreur lors de la création du compte Admin",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
} 