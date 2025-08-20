const { PrismaClient } = require('@prisma/client')

async function fixDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Diagnostic de la base de données...')
    await prisma.$connect()
    console.log('✅ Connexion réussie')
    
    // Vérifier la structure de la table users
    const userColumns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users'
    `
    console.log('Colonnes users:', userColumns.map(c => c.column_name))
    
    const hasEmailVerifiedAt = userColumns.some(col => col.column_name === 'emailVerifiedAt')
    console.log('emailVerifiedAt existe:', hasEmailVerifiedAt)
    
    if (!hasEmailVerifiedAt) {
      console.log('🛠️  Application des migrations...')
      const { execSync } = require('child_process')
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    }
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDatabase() 