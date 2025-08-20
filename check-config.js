// Script pour vérifier la configuration
console.log('🔧 Vérification de la configuration...\n')

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'RESEND_API_KEY',
  'RESEND_FROM'
]

console.log('📋 Variables d\'environnement requises:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('KEY') ? '***' : value}`)
  } else {
    console.log(`❌ ${varName}: MANQUANTE`)
  }
})

console.log('\n🔍 Vérification des URLs:')
const urls = {
  'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
  'Production URL': 'https://inconnu-os-sea-production.up.railway.app'
}

Object.entries(urls).forEach(([name, url]) => {
  if (url) {
    console.log(`✅ ${name}: ${url}`)
  } else {
    console.log(`❌ ${name}: Non définie`)
  }
})

console.log('\n📧 Configuration email:')
const emailConfig = {
  'RESEND_API_KEY': process.env.RESEND_API_KEY ? 'Configuré' : 'Manquant',
  'RESEND_FROM': process.env.RESEND_FROM || 'onboarding@resend.dev'
}

Object.entries(emailConfig).forEach(([key, value]) => {
  console.log(`✅ ${key}: ${value}`)
})

console.log('\n🎯 Recommandations:')
if (!process.env.RESEND_API_KEY) {
  console.log('⚠️  RESEND_API_KEY manquante - Les emails ne seront pas envoyés')
}
if (!process.env.NEXTAUTH_SECRET) {
  console.log('⚠️  NEXTAUTH_SECRET manquante - Problèmes d\'authentification possibles')
}
if (!process.env.DATABASE_URL) {
  console.log('⚠️  DATABASE_URL manquante - Impossible de se connecter à la base de données')
} 