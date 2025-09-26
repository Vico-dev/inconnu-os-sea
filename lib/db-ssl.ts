// Configuration SSL pour la base de données PostgreSQL
export const dbConfig = {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
}

// URL de connexion avec paramètres SSL
export function getDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) return baseUrl
  
  // Ajouter les paramètres SSL pour Railway
  if (process.env.NODE_ENV === 'production') {
    const url = new URL(baseUrl)
    url.searchParams.set('sslmode', 'require')
    url.searchParams.set('sslcert', '')
    url.searchParams.set('sslkey', '')
    url.searchParams.set('sslrootcert', '')
    return url.toString()
  }
  
  return baseUrl
}
