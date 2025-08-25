import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const prospects = await prisma.prospect.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      prospects: prospects.map(prospect => ({
        id: prospect.id,
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        email: prospect.email,
        phone: prospect.phone,
        company: prospect.company,
        budget: prospect.budget,
        status: prospect.status,
        source: prospect.source,
        message: prospect.message,
        notes: prospect.notes,
        score: prospect.score,
        createdAt: prospect.createdAt
      }))
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des prospects:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Pour les formulaires publics, on ne vérifie pas l'authentification
    // Pour les créations admin, on vérifie l'authentification
    const session = await getServerSession(authOptions)
    const isAdminRequest = session?.user?.email && session.user.role === 'ADMIN'
    
    // Si c'est une requête admin, vérifier les permissions
    if (isAdminRequest) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      budget,
      source,
      notes,
      message // Ajouter le champ message du formulaire de contact
    } = body

    // Validation des champs requis
    if (!firstName || !lastName || !email || !company) {
      return NextResponse.json(
        { error: 'Prénom, nom, email et entreprise sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingProspect = await prisma.prospect.findFirst({
      where: { email }
    })

    if (existingProspect) {
      return NextResponse.json(
        { error: 'Un prospect avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Calculer un score de base
    const score = calculateProspectScore({
      budget,
      source
    })

    const prospect = await prisma.prospect.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || '',
        company,
        budget: budget ? parseFloat(budget) : null,
        status: 'NEW',
        source: source || 'WEBSITE', // Source par défaut pour formulaire de contact
        message: message || '', // Utiliser le champ message
        notes: notes || '', // Notes séparées
        score
      }
    })

    return NextResponse.json({
      success: true,
      prospectId: prospect.id, // Retourner l'ID pour le tracking
      prospect: {
        id: prospect.id,
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        email: prospect.email,
        phone: prospect.phone,
        company: prospect.company,
        budget: prospect.budget,
        status: prospect.status,
        source: prospect.source,
        message: prospect.message,
        notes: prospect.notes,
        score: prospect.score,
        createdAt: prospect.createdAt
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création du prospect:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

function calculateProspectScore(data: {
  budget?: number | null
  source?: string
}): number {
  let score = 50 // Score de base

  // Score basé sur le budget
  if (data.budget) {
    if (data.budget >= 5000) score += 25
    else if (data.budget >= 2000) score += 15
    else if (data.budget >= 500) score += 10
  }

  // Score basé sur la source
  if (data.source === 'REFERRAL') score += 15
  else if (data.source === 'WEBSITE') score += 10
  else if (data.source === 'LINKEDIN') score += 5

  return Math.min(score, 100) // Score maximum de 100
} 