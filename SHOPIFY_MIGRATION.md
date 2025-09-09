# Migration Shopify API REST → GraphQL

## 🚨 Problème identifié

**Date :** Septembre 2025  
**Statut :** ✅ RÉSOLU

### Alerte Shopify
- **API Admin REST** `/products` et `/variants` **OBSOLÈTE** depuis la version 2024-04
- **Date limite de migration :** 1er juillet 2025 (DÉPASSÉE)
- **Risque :** Application peut être retirée de la liste Shopify

## 🔄 Solution implémentée

### Migration vers GraphQL Admin API
- **Nouveau service :** `ShopifyGraphQLService` 
- **API version :** 2024-07 (dernière version stable)
- **Endpoint :** `https://api.shopify.com/admin/api/2024-07/graphql.json`

### Avantages de GraphQL
1. **Performance** : Une seule requête pour récupérer produits + variantes + images
2. **Support officiel** : API moderne et maintenue par Shopify
3. **Flexibilité** : Sélection précise des champs nécessaires
4. **Pagination** : Gestion native avec cursors

## 📁 Fichiers modifiés

### Nouveau service
- `src/lib/shopify-graphql-service.ts` ✅ **NOUVEAU**

### APIs migrées
- `src/app/api/shopify/products/route.ts` ✅ **MIGRÉ**
- `src/app/api/shopify/ai-analysis/route.ts` ✅ **MIGRÉ**
- `src/app/api/shopify/recruitment/route.ts` ✅ **MIGRÉ**
- `src/app/api/shopify/stores/route.ts` ✅ **MIGRÉ**
- `src/app/api/shopify/auth/route.ts` ✅ **MIGRÉ**
- `src/app/api/shopify/callback/route.ts` ✅ **MIGRÉ**

### Ancien service (à supprimer)
- `src/lib/shopify-service.ts` ❌ **OBSOLÈTE**

## 🚀 Déploiement

### Build local
```bash
npm run build  # ✅ SUCCÈS
```

### Déploiement production
```bash
railway up  # Prêt pour le déploiement
```

## 🔧 Configuration requise

### Variables d'environnement
```env
SHOPIFY_CLIENT_ID=votre_client_id
SHOPIFY_REDIRECT_URI=votre_redirect_uri
```

### Scopes OAuth
```typescript
const scopes = [
  'read_products',      // Lecture des produits
  'read_inventory',     // Lecture du stock
  'read_orders'         // Lecture des commandes
]
```

## 📊 Comparaison des performances

### Avant (REST)
```typescript
// 3 requêtes séparées
const products = await fetch('/admin/api/2024-01/products.json')
const variants = await fetch('/admin/api/2024-01/variants.json')
const images = await fetch('/admin/api/2024-01/images.json')
```

### Après (GraphQL)
```typescript
// 1 seule requête
const query = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id, title, variants, images
        }
      }
    }
  }
`
```

## ✅ Validation

### Tests effectués
1. **Build local** : ✅ Succès
2. **Migration des endpoints** : ✅ Complète
3. **Compatibilité des interfaces** : ✅ Maintenue
4. **Performance** : ✅ Améliorée

### Prochaines étapes
1. **Déploiement production** : En attente
2. **Tests en production** : À effectuer
3. **Suppression ancien service** : Après validation

## 🎯 Bénéfices

- **Conformité Shopify** : Plus de risque de dépréciation
- **Performance** : Réduction des appels API
- **Maintenance** : Code moderne et maintenu
- **Évolutivité** : Support des nouvelles fonctionnalités Shopify

---

**Note :** Cette migration résout le problème critique de dépréciation de l'API REST et assure la conformité avec les standards Shopify actuels. 