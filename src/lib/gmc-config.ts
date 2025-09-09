export const GMC_CONFIG = {
  // Limites de l'API
  BATCH_SIZE: 1000,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_TITLE_LENGTH: 150,
  
  // Catégories Google par défaut
  DEFAULT_CATEGORY: '1604', // Apparel & Accessories
  
  // Mapping des catégories Shopify vers Google
  CATEGORY_MAPPING: {
    'vêtements': '1604',
    'chaussures': '187',
    'accessoires': '1604',
    'bijoux': '281',
    'maison': '206',
    'sport': '888',
    'beauté': '159',
    'électronique': '293',
    'livres': '266',
    'jouets': '220',
    'automobile': '267',
    'jardin': '206',
    'cuisine': '206',
    'décoration': '206',
    'mode': '1604',
    'cosmétiques': '159',
    'parfums': '159',
    'montres': '281',
    'lunettes': '1604',
    'sacs': '1604',
    'ceintures': '1604',
    'cravates': '1604',
    'chapeaux': '1604',
    'gants': '1604',
    'écharpes': '1604',
    'collants': '1604',
    'lingerie': '1604',
    'maillots': '1604',
    'costumes': '1604',
    'robes': '1604',
    'pantalons': '1604',
    'jupes': '1604',
    'blouses': '1604',
    'chemises': '1604',
    'pulls': '1604',
    'vestes': '1604',
    'manteaux': '1604',
    'imperméables': '1604',
    'blousons': '1604',
    'cardigans': '1604',
    'gilets': '1604',
    't-shirts': '1604',
    'polo': '1604',
    'chemisiers': '1604',
    'tuniques': '1604',
    'combinaisons': '1604',
    'salopettes': '1604',
    'shorts': '1604',
    'bermudas': '1604',
    'leggings': '1604',
    'joggings': '1604',
    'survêtements': '1604',
    'tenues de sport': '888',
    'équipements sportifs': '888',
    'vélos': '888',
    'skis': '888',
    'planches de surf': '888',
    'raquettes': '888',
    'ballons': '888',
    'haltères': '888',
    'tapis de yoga': '888',
    'vêtements de yoga': '888',
    'vêtements de fitness': '888',
    'vêtements de running': '888',
    'vêtements de cyclisme': '888',
    'vêtements de natation': '888',
    'vêtements de ski': '888',
    'vêtements de randonnée': '888',
    'vêtements de golf': '888',
    'vêtements de tennis': '888',
    'vêtements de football': '888',
    'vêtements de basket': '888',
    'vêtements de volley': '888',
    'vêtements de handball': '888',
    'vêtements de rugby': '888',
    'vêtements de hockey': '888',
    'vêtements de baseball': '888',
    'vêtements de cricket': '888',
    'vêtements de badminton': '888',
    'vêtements de squash': '888',
    'vêtements de padel': '888',
    'vêtements de tennis de table': '888',
    'vêtements de billard': '888',
    'vêtements de bowling': '888',
    'vêtements de pétanque': '888',
    'vêtements de boules': '888',
    'vêtements de quilles': '888',
    'vêtements de curling': '888',
    'vêtements de biathlon': '888',
    'vêtements de luge': '888',
    'vêtements de bobsleigh': '888',
    'vêtements de skeleton': '888',
    'vêtements de patinage': '888',
    'vêtements de hockey sur glace': '888',
    'vêtements de curling': '888',
    'vêtements de biathlon': '888',
    'vêtements de luge': '888',
    'vêtements de bobsleigh': '888',
    'vêtements de skeleton': '888',
    'vêtements de patinage': '888',
    'vêtements de hockey sur glace': '888',
  },
  
  // Mots-clés pour la détection automatique des catégories
  CATEGORY_KEYWORDS: {
    '1604': ['vêtement', 'habit', 'fringue', 'fringues', 'fringue', 'fringues', 'fringue', 'fringues'],
    '187': ['chaussure', 'chaussures', 'soulier', 'souliers', 'basket', 'baskets', 'sneaker', 'sneakers'],
    '281': ['bijou', 'bijoux', 'joaillerie', 'joaillerie', 'diamant', 'diamants', 'or', 'argent', 'platine'],
    '206': ['maison', 'déco', 'décoration', 'mobilier', 'meuble', 'meubles', 'jardin', 'cuisine'],
    '888': ['sport', 'sportif', 'sportive', 'fitness', 'musculation', 'cardio', 'endurance'],
    '159': ['beauté', 'cosmétique', 'cosmétiques', 'soin', 'soins', 'maquillage', 'parfum', 'parfums'],
    '293': ['électronique', 'électrique', 'informatique', 'ordinateur', 'ordinateurs', 'smartphone', 'smartphones'],
  },
  
  // Configuration des labels personnalisés
  CUSTOM_LABELS: {
    LABEL_0: 'performance_score',
    LABEL_1: 'optimization_status',
    LABEL_2: 'ai_analysis_date',
    LABEL_3: 'product_quality',
    LABEL_4: 'conversion_potential',
  },
  
  // Validation des produits
  VALIDATION_RULES: {
    REQUIRED_FIELDS: ['id', 'title', 'price', 'availability', 'brand'],
    MIN_TITLE_LENGTH: 10,
    MAX_TITLE_LENGTH: 150,
    MIN_DESCRIPTION_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 5000,
    PRICE_MIN: 0.01,
    PRICE_MAX: 999999.99,
  },
  
  // Configuration des erreurs
  ERROR_MESSAGES: {
    MISSING_REQUIRED_FIELD: 'Champ requis manquant',
    INVALID_PRICE: 'Prix invalide',
    TITLE_TOO_SHORT: 'Titre trop court',
    TITLE_TOO_LONG: 'Titre trop long',
    DESCRIPTION_TOO_SHORT: 'Description trop courte',
    DESCRIPTION_TOO_LONG: 'Description trop longue',
    INVALID_CATEGORY: 'Catégorie invalide',
    INVALID_AVAILABILITY: 'Disponibilité invalide',
  },
};

export function mapShopifyCategoryToGMC(productType: string, tags: string = ''): string {
  if (!productType && !tags) {
    return GMC_CONFIG.DEFAULT_CATEGORY;
  }
  
  const searchText = `${productType} ${tags}`.toLowerCase();
  
  // Recherche exacte dans le mapping
  for (const [key, value] of Object.entries(GMC_CONFIG.CATEGORY_MAPPING)) {
    if (searchText.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Recherche par mots-clés
  for (const [categoryId, keywords] of Object.entries(GMC_CONFIG.CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return categoryId;
      }
    }
  }
  
  return GMC_CONFIG.DEFAULT_CATEGORY;
}

export function validateGMCProduct(product: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Vérification des champs requis
  for (const field of GMC_CONFIG.VALIDATION_RULES.REQUIRED_FIELDS) {
    if (!product[field]) {
      errors.push(`${GMC_CONFIG.ERROR_MESSAGES.MISSING_REQUIRED_FIELD}: ${field}`);
    }
  }
  
  // Validation du titre
  if (product.title) {
    if (product.title.length < GMC_CONFIG.VALIDATION_RULES.MIN_TITLE_LENGTH) {
      errors.push(GMC_CONFIG.ERROR_MESSAGES.TITLE_TOO_SHORT);
    }
    if (product.title.length > GMC_CONFIG.VALIDATION_RULES.MAX_TITLE_LENGTH) {
      errors.push(GMC_CONFIG.ERROR_MESSAGES.TITLE_TOO_LONG);
    }
  }
  
  // Validation de la description
  if (product.description) {
    if (product.description.length < GMC_CONFIG.VALIDATION_RULES.MIN_DESCRIPTION_LENGTH) {
      errors.push(GMC_CONFIG.ERROR_MESSAGES.DESCRIPTION_TOO_SHORT);
    }
    if (product.description.length > GMC_CONFIG.VALIDATION_RULES.MAX_DESCRIPTION_LENGTH) {
      errors.push(GMC_CONFIG.ERROR_MESSAGES.DESCRIPTION_TOO_LONG);
    }
  }
  
  // Validation du prix
  if (product.price?.value) {
    const price = parseFloat(product.price.value);
    if (isNaN(price) || price < GMC_CONFIG.VALIDATION_RULES.PRICE_MIN || price > GMC_CONFIG.VALIDATION_RULES.PRICE_MAX) {
      errors.push(GMC_CONFIG.ERROR_MESSAGES.INVALID_PRICE);
    }
  }
  
  // Validation de la disponibilité
  const validAvailability = ['in stock', 'out of stock', 'preorder'];
  if (product.availability && !validAvailability.includes(product.availability)) {
    errors.push(GMC_CONFIG.ERROR_MESSAGES.INVALID_AVAILABILITY);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
} 