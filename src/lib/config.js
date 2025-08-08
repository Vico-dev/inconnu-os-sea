// Configuration pour l'architecture hybride
const config = {
  // URL du backend Railway (à configurer)
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://inconnu-os-sea-production.up.railway.app',
  
  // Configuration pour les appels API
  API_CONFIG: {
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://inconnu-os-sea-production.up.railway.app',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

module.exports = config 