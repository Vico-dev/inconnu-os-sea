import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Diagnostic de la base de données...')
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? 'Configurée' : 'Manquante',
      connection: 'unknown',
      tables: [],
      counts: {},
      errors: []
    }

    // Test de connexion
    try {
      console.log('📡 Test de connexion...')
      await prisma.$queryRaw`SELECT 1`
      diagnostics.connection = 'success'
      console.log('✅ Connexion réussie')
    } catch (error) {
      diagnostics.connection = 'failed'
      diagnostics.errors.push(`Connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      console.log('❌ Erreur de connexion:', error)
    }

    // Vérifier les tables si la connexion fonctionne
    if (diagnostics.connection === 'success') {
      try {
        console.log('📋 Vérification des tables...')
        const tables = await prisma.$queryRaw`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `
        diagnostics.tables = (tables as any[]).map(t => t.table_name)
        console.log('📊 Tables trouvées:', diagnostics.tables)
      } catch (error) {
        diagnostics.errors.push(`Tables: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }

      // Compter les enregistrements
      try {
        console.log('👥 Comptage des enregistrements...')
        const [userCount, companyCount, clientCount, mandateCount] = await Promise.all([
          prisma.user.count(),
          prisma.company.count(),
          prisma.clientAccount.count(),
          prisma.advertisingMandate.count()
        ])

        diagnostics.counts = {
          users: userCount,
          companies: companyCount,
          clientAccounts: clientCount,
          advertisingMandates: mandateCount
        }
        console.log('✅ Comptages terminés')
      } catch (error) {
        diagnostics.errors.push(`Comptage: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }

    console.log('📊 Diagnostic terminé:', diagnostics)
    return NextResponse.json(diagnostics)

  } catch (error: any) {
    console.error('❌ Erreur diagnostic:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du diagnostic',
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Application des migrations...')
    
    // Note: En production, il est préférable d'appliquer les migrations via CLI
    // Cette API est juste pour le diagnostic
    
    return NextResponse.json({
      message: 'Pour appliquer les migrations, utilisez: npx prisma migrate deploy',
      note: 'Les migrations doivent être appliquées via CLI en production'
    })

  } catch (error: any) {
    console.error('❌ Erreur migration:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de l\'application des migrations',
      details: error.message 
    }, { status: 500 })
  }
} 