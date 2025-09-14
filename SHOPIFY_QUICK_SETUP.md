# 🚀 Configuration Rapide Shopify - INCONNU_OS

## ⚡ **Actions immédiates (5 minutes) :**

### **1. Railway - Variables d'environnement :**

1. **Aller sur https://railway.app/**
2. **Sélectionner le projet** `inconnu-os-sea`
3. **Onglet "Variables"**
4. **Ajouter ces variables :**

```env
SHOPIFY_CLIENT_ID=your_client_id_here
SHOPIFY_CLIENT_SECRET=your_client_secret_here
SHOPIFY_REDIRECT_URI=https://inconnu-os-sea-production.up.railway.app/api/shopify/callback
SHOPIFY_SCOPES=read_products,read_inventory,read_orders
```

### **2. Shopify Partner Dashboard - App :**

1. **Aller sur https://partners.shopify.com/**
2. **Créer une nouvelle app** ou **modifier l'existante**
3. **Configuration :**
   - **App name** : `INCONNU_OS`
   - **App URL** : `https://inconnu-os-sea-production.up.railway.app`
   - **Allowed redirection URL(s)** : `https://inconnu-os-sea-production.up.railway.app/api/shopify/callback`

4. **Scopes requis :**
   - `read_products` - Lire les produits
   - `read_inventory` - Lire l'inventaire  
   - `read_orders` - Lire les commandes

5. **Copier les identifiants :**
   - **Client ID** → Coller dans `SHOPIFY_CLIENT_ID`
   - **Client secret** → Coller dans `SHOPIFY_CLIENT_SECRET`

### **3. Test de l'installation :**

1. **Créer une boutique de test** dans le Partner Dashboard
2. **Installer l'app** via l'URL de test
3. **Vérifier** que le feed manager fonctionne

## 🔍 **Vérification :**

Après configuration, relancer le test :
```bash
node test-shopify-config.js
```

**Résultat attendu :**
- ✅ SHOPIFY_CLIENT_ID: Présent
- ✅ SHOPIFY_CLIENT_SECRET: Présent  
- ✅ SHOPIFY_REDIRECT_URI: Présent
- ✅ Auth endpoint fonctionne

## 🎯 **Résultat :**

Une fois configuré, l'erreur de dépréciation REST disparaîtra et l'app pourra être installée sur les boutiques !

---

**Temps estimé :** 5-10 minutes
**Difficulté :** Facile
**Impact :** Résout définitivement l'erreur Shopify
