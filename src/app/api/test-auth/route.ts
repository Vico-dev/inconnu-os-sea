import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Test de connexion à la base de données
    await prisma.$connect()
    
    // Vérifier les variables d&apos;environnement
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV
    }
    
    // Tester la recherche d&apos;un utilisateur
    const testUser = await prisma.user.findFirst({
      where: { email: 'client@test.com' },
      select: {
        id: true,
        email: true,
        role: true,
        password: true
      }
    })
    
    // Tester le hash du mot de passe
    const testPassword = 'password123'
    const isPasswordValid = testUser ? await bcrypt.compare(testPassword, testUser.password) : false
    
    return NextResponse.json({
      success: true,
      message: 'Configuration OK',
      envCheck,
      testUser: testUser ? {
        id: testUser.id,
        email: testUser.email,
        role: testUser.role,
        hasPassword: !!testUser.password,
        passwordValid: isPasswordValid
      } : null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erreur de test:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 