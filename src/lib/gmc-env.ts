// Configuration d'environnement pour Google Merchant Center
export const GMC_ENV = {
  // Google Cloud Configuration
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
  
  // Google Merchant Center
  GMC_DEFAULT_MERCHANT_ID: process.env.GMC_DEFAULT_MERCHANT_ID || '123456789',
  GMC_ACCOUNT_NAME: process.env.GMC_ACCOUNT_NAME || 'Mon E-commerce',
  
  // Shopify Configuration
  SHOPIFY_STORE_URL: process.env.SHOPIFY_STORE_URL || 'https://example.myshopify.com',
  
  // Configuration de l'API
  GMC_BATCH_SIZE: parseInt(process.env.GMC_BATCH_SIZE || '1000'),
  GMC_MAX_RETRIES: parseInt(process.env.GMC_MAX_RETRIES || '3'),
  GMC_RETRY_DELAY: parseInt(process.env.GMC_RETRY_DELAY || '1000'),
  
  // Mode développement (true = mock, false = vraie API)
  GMC_DEV_MODE: process.env.GMC_DEV_MODE === 'true' || !process.env.GOOGLE_APPLICATION_CREDENTIALS,
  
  // Logging
  GMC_LOG_LEVEL: process.env.GMC_LOG_LEVEL || 'info',
  GMC_ENABLE_DEBUG: process.env.GMC_ENABLE_DEBUG === 'true',
};

// Validation de la configuration
export function validateGMCConfig() {
  const errors: string[] = [];
  
  if (!GMC_ENV.GMC_DEV_MODE) {
    if (!GMC_ENV.GOOGLE_APPLICATION_CREDENTIALS) {
      errors.push('GOOGLE_APPLICATION_CREDENTIALS requis en mode production');
    }
    if (!GMC_ENV.GOOGLE_CLOUD_PROJECT_ID) {
      errors.push('GOOGLE_CLOUD_PROJECT_ID requis en mode production');
    }
  }
  
  // En mode dev, on accepte les valeurs par défaut
  if (!GMC_ENV.GMC_DEV_MODE) {
    if (!GMC_ENV.GMC_DEFAULT_MERCHANT_ID || GMC_ENV.GMC_DEFAULT_MERCHANT_ID === '123456789') {
      errors.push('GMC_DEFAULT_MERCHANT_ID doit être configuré avec un vrai Merchant ID');
    }
    
    if (GMC_ENV.SHOPIFY_STORE_URL === 'https://example.myshopify.com') {
      errors.push('SHOPIFY_STORE_URL doit être configuré avec une vraie URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    config: GMC_ENV,
  };
}

// Affichage de la configuration actuelle
export function logGMCConfig() {
  console.log('🔧 Configuration GMC:');
  console.log(`  Mode développement: ${GMC_ENV.GMC_DEV_MODE ? '✅ Activé' : '❌ Désactivé'}`);
  console.log(`  Merchant ID: ${GMC_ENV.GMC_DEFAULT_MERCHANT_ID}`);
  console.log(`  Store URL: ${GMC_ENV.SHOPIFY_STORE_URL}`);
  console.log(`  Batch size: ${GMC_ENV.GMC_BATCH_SIZE}`);
  console.log(`  Max retries: ${GMC_ENV.GMC_MAX_RETRIES}`);
  
  if (GMC_ENV.GMC_DEV_MODE) {
    console.log('⚠️  Mode développement: L\'API GMC sera simulée');
  } else {
    console.log('🚀 Mode production: Connexion à la vraie API GMC');
  }
} 