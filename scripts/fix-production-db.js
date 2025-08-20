const { PrismaClient } = require('@prisma/client')

async function diagnoseDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Diagnostic de la base de données...')
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')
    
    // Vérifier la structure de la table users
    console.log('\n📋 Structure de la table users:')
    const userColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `
    console.table(userColumns)
    
    // Vérifier les migrations appliquées
    console.log('\n📦 Migrations appliquées:')
    const migrations = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations 
      ORDER BY finished_at DESC
    `
    console.table(migrations)
    
    // Vérifier si la colonne emailVerifiedAt existe
    const hasEmailVerifiedAt = userColumns.some(col => col.column_name === 'emailVerifiedAt')
    console.log(`\n🔍 Colonne emailVerifiedAt existe: ${hasEmailVerifiedAt}`)
    
    if (!hasEmailVerifiedAt) {
      console.log('\n⚠️  La colonne emailVerifiedAt manque !')
      console.log('🛠️  Application des migrations...')
      
      // Appliquer les migrations
      const { execSync } = require('child_process')
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' })
        console.log('✅ Migrations appliquées avec succès')
      } catch (error) {
        console.error('❌ Erreur lors de l\'application des migrations:', error.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur de diagnostic:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseDatabase() 