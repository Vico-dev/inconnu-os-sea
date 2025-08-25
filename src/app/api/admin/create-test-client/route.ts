import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, firstName, lastName, company } = body

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        firstName: firstName || 'Client',
        lastName: lastName || 'Test',
        password: hashedPassword,
        role: 'CLIENT',
        company: company || 'Entreprise Test',
        emailVerified: true
      }
    })

    // Créer l'entreprise
    const companyRecord = await prisma.company.create({
      data: {
        name: company || 'Entreprise Test',
        industry: 'E-commerce',
        teamSize: '10-50'
      }
    })

    // Créer le compte client
    const clientAccount = await prisma.clientAccount.create({
      data: {
        userId: user.id,
        companyId: companyRecord.id,
        subscriptionPlan: 'BASIC',
        monthlyBudget: 1000,
        onboardingCompleted: true,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      client: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountId: clientAccount.id,
        company: companyRecord.name
      },
      credentials: {
        email: user.email,
        password: password // Retourner le mot de passe en clair pour l'admin
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création du client test:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 