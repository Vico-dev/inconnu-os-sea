// Configuration pour le backend Railway
const BACKEND_CONFIG = {
  // URL du backend Railway (à configurer)
  API_BASE_URL: process.env.RAILWAY_BACKEND_URL || 'https://inconnu-os-backend-production.up.railway.app',
  
  // Endpoints API
  ENDPOINTS: {
    AUTH: '/api/auth',
    HEALTH: '/api/health',
    ADMIN: '/api/admin',
    TICKETS: '/api/tickets',
    GOOGLE_ADS: '/api/google-ads',
    SUBSCRIPTION: '/api/subscription',
    STRIPE: '/api/stripe',
    APPOINTMENTS: '/api/appointments',
    ONBOARDING: '/api/onboarding'
  },
  
  // Configuration CORS
  CORS_ORIGINS: [
    'https://inconnu-os-29o95v63v-inconnus-projects-d4cd4b6a.vercel.app',
    'http://localhost:3000'
  ]
}

module.exports = BACKEND_CONFIG 