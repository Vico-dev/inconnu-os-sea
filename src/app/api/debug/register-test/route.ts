import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Test inscription - Début')
    
    const body = await request.json()
    console.log('📝 Données reçues:', { ...body, password: '[HIDDEN]' })

    const { firstName, lastName, email, password, company } = body

    // Validation basique
    if (!firstName || !lastName || !email || !password) {
      console.log('❌ Validation échouée')
      return NextResponse.json(
        { error: "Champs manquants", received: { firstName, lastName, email, password: !!password } },
        { status: 400 }
      )
    }

    console.log('✅ Validation OK')

    // Test connexion base de données
    try {
      console.log('🔌 Test connexion DB...')
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ DB connectée')
    } catch (dbError) {
      console.log('❌ Erreur DB:', dbError)
      return NextResponse.json(
        { error: "Erreur base de données", details: dbError instanceof Error ? dbError.message : 'Unknown' },
        { status: 500 }
      )
    }

    // Vérifier si l'utilisateur existe
    try {
      console.log('🔍 Vérification utilisateur existant...')
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        console.log('❌ Utilisateur existe déjà')
        return NextResponse.json(
          { error: "Utilisateur existe déjà" },
          { status: 400 }
        )
      }
      console.log('✅ Utilisateur unique')
    } catch (error) {
      console.log('❌ Erreur vérification utilisateur:', error)
      return NextResponse.json(
        { error: "Erreur vérification utilisateur", details: error instanceof Error ? error.message : 'Unknown' },
        { status: 500 }
      )
    }

    // Créer l'utilisateur
    try {
      console.log('👤 Création utilisateur...')
      const hashedPassword = await bcryptjs.hash(password, 12)
      
      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          password: hashedPassword,
          role: "CLIENT",
          company: company || null,
          emailVerified: false
        }
      })
      
      console.log('✅ Utilisateur créé:', { id: user.id, email: user.email })
      
      return NextResponse.json({
        success: true,
        message: "Utilisateur créé avec succès (test)",
        userId: user.id,
        email: user.email
      })

    } catch (error) {
      console.log('❌ Erreur création utilisateur:', error)
      return NextResponse.json(
        { 
          error: "Erreur création utilisateur", 
          details: error instanceof Error ? error.message : 'Unknown',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.log('❌ Erreur générale:', error)
    return NextResponse.json(
      { 
        error: "Erreur générale", 
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
} 