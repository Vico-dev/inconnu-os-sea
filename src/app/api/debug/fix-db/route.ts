import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Diagnostic de la base de données...')
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')
    
    // Vérifier la structure de la table users
    const userColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `
    
    console.log('📋 Colonnes de la table users:', userColumns)
    
    // Vérifier si la colonne emailVerifiedAt existe
    const hasEmailVerifiedAt = userColumns.some((col: any) => col.column_name === 'emailVerifiedAt')
    console.log(`🔍 Colonne emailVerifiedAt existe: ${hasEmailVerifiedAt}`)
    
    // Vérifier les migrations appliquées
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at DESC
    `
    
    console.log('📦 Migrations appliquées:', migrations)
    
    if (!hasEmailVerifiedAt) {
      console.log('⚠️  La colonne emailVerifiedAt manque !')
      console.log('🛠️  Tentative d\'application des migrations...')
      
      // Essayer d'appliquer les migrations
      try {
        // Forcer la synchronisation du schéma
        await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP`
        console.log('✅ Colonne emailVerifiedAt ajoutée')
      } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de la colonne:', error)
      }
    }
    
    return NextResponse.json({
      status: 'success',
      connection: 'ok',
      userColumns: userColumns,
      hasEmailVerifiedAt: hasEmailVerifiedAt,
      migrations: migrations,
      message: hasEmailVerifiedAt ? 'Base de données OK' : 'Colonne manquante ajoutée'
    })
    
  } catch (error) {
    console.error('❌ Erreur de diagnostic:', error)
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 