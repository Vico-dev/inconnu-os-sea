import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, company, message, notes, score, budget, status } = body

    // Validation des champs requis
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Prénom, nom et email sont requis' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    // Validation du score
    if (score !== undefined && (score < 1 || score > 10)) {
      return NextResponse.json(
        { error: 'Score doit être entre 1 et 10' },
        { status: 400 }
      )
    }

    // Créer le prospect
    const prospect = await prisma.prospect.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        company: company || null,
        message: message || null,
        notes: notes || null,
        score: score || null,
        budget: budget || null,
        source: 'WEBSITE',
        status: status || 'NEW'
      }
    })

    return NextResponse.json(
      { 
        message: 'Prospect créé avec succès',
        prospect 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création du prospect:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Construire les filtres
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Récupérer les prospects avec pagination
    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.prospect.count({ where })
    ])

    return NextResponse.json({
      prospects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des prospects:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 