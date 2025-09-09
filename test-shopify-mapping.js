// Simulation des données Shopify pour tester le mapping
const mockShopifyProduct = {
  id: "123456789",
  title: "Produit de test avec stock",
  description: "Ceci est une description de test complète avec plus de 100 caractères pour tester le système d'analyse IA et voir comment les données sont mappées dans l'interface utilisateur.",
  vendor: "crashtest inconnu",
  productType: "Accessoires",
  tags: ["test", "nouveau", "qualité"],
  status: "active",
  publishedAt: "2024-01-01T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  currency: "EUR",
  variants: [
    {
      id: "987654321",
      title: "Default Title",
      sku: "TEST-SKU-001",
      price: "101.00",
      compareAtPrice: null,
      inventoryQuantity: 5,
      inventoryPolicy: "deny",
      weight: 0.5,
      weightUnit: "kg",
      requiresShipping: true,
      taxable: true,
      barcode: "1234567890123"
    }
  ],
  images: [
    {
      id: "img1",
      src: "https://example.com/image1.jpg",
      alt: "Image du produit",
      width: 800,
      height: 600
    }
  ],
  collections: ["Accessoires", "Nouveautés"],
  seo: {
    title: "Produit de test SEO",
    description: "Description SEO du produit"
  }
};

console.log('🧪 Test du mapping des données Shopify...\n');

console.log('1. Données originales Shopify:');
console.log('Title:', mockShopifyProduct.title);
console.log('Description:', mockShopifyProduct.description);
console.log('Currency:', mockShopifyProduct.currency);
console.log('Variants:', mockShopifyProduct.variants.length);
console.log('Images:', mockShopifyProduct.images.length);
console.log('Tags:', mockShopifyProduct.tags);
console.log('Collections:', mockShopifyProduct.collections);

console.log('\n2. Test du mapping (simulation):');
const primaryVariant = mockShopifyProduct.variants[0];
const primaryImage = mockShopifyProduct.images[0];

const mappedProduct = {
  id: mockShopifyProduct.id,
  title: mockShopifyProduct.title,
  description: mockShopifyProduct.description,
  price: `${primaryVariant.price} ${mockShopifyProduct.currency}`,
  availability: (primaryVariant.inventoryQuantity || 0) > 0 ? 'in stock' : 'out of stock',
  brand: mockShopifyProduct.vendor,
  product_type: mockShopifyProduct.productType,
  image_link: primaryImage?.src || '',
  tags: Array.isArray(mockShopifyProduct.tags) ? mockShopifyProduct.tags.join(',') : '',
  collections: Array.isArray(mockShopifyProduct.collections) ? mockShopifyProduct.collections.join(',') : ''
};

console.log('Mapped Product:');
console.log('ID:', mappedProduct.id);
console.log('Title:', mappedProduct.title);
console.log('Description:', mappedProduct.description);
console.log('Price:', mappedProduct.price);
console.log('Availability:', mappedProduct.availability);
console.log('Brand:', mappedProduct.brand);
console.log('Type:', mappedProduct.product_type);
console.log('Image:', mappedProduct.image_link);
console.log('Tags:', mappedProduct.tags);
console.log('Collections:', mappedProduct.collections);

console.log('\n3. Vérification des problèmes potentiels:');
console.log('Description présente:', !!mockShopifyProduct.description);
console.log('Description longueur:', mockShopifyProduct.description?.length || 0);
console.log('Stock disponible:', primaryVariant.inventoryQuantity);
console.log('Currency:', mockShopifyProduct.currency);
console.log('Vendor:', mockShopifyProduct.vendor); 