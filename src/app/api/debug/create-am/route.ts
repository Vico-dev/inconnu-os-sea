import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Création du compte Account Manager...')
    
    // Créer l'utilisateur AM
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'am2@agence-inconnu.fr',
        firstName: 'Account',
        lastName: 'Manager Test',
        password: hashedPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: 'ACCOUNT_MANAGER'
      }
    })
    
    console.log('✅ Utilisateur AM créé:', user.id)
    
    // Créer le compte AM
    const am = await prisma.accountManager.create({
      data: {
        userId: user.id
      }
    })
    
    console.log('✅ Compte AM créé:', am.id)
    
    // Créer une entreprise pour l'AM
    const company = await prisma.company.create({
      data: {
        name: 'Agence Inconnu - Équipe AM',
        website: 'https://agence-inconnu.fr',
        industry: 'Marketing Digital',
        teamSize: '10-25'
      }
    })
    
    console.log('✅ Entreprise créée:', company.id)
    
    // Associer l'AM à l'entreprise
    await prisma.accountManager.update({
      where: { id: am.id },
      data: { companyId: company.id }
    })
    
    console.log('✅ AM associé à l\'entreprise')
    
    // Créer quelques clients de test pour l'AM
    const testClients = [
      {
        email: 'client1@test.com',
        name: 'Client Test 1',
        companyName: 'Entreprise Test 1',
        website: 'https://test1.com',
        industry: 'E-commerce'
      },
      {
        email: 'client2@test.com',
        name: 'Client Test 2',
        companyName: 'Entreprise Test 2',
        website: 'https://test2.com',
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
          monthlyBudget: 2000,
          onboardingCompleted: true,
          googleAdsConnected: true,
          status: 'ACTIVE',
          assignedAccountManagerId: am.id
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
      message: 'Compte AM créé avec succès',
      data: {
        am: {
          id: am.id,
          email: 'am2@agence-inconnu.fr',
          password: 'password123'
        },
        company: {
          id: company.id,
          name: company.name
        },
        clients: createdClients
      }
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
    return NextResponse.json({
      error: "Erreur lors de la création du compte AM",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
} 