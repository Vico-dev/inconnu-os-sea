# 🔧 Fix: Erreur OAuth Shopify - redirect_uri not whitelisted

## 🚨 **Erreur actuelle :**
```
Oauth error invalid_request: The redirect_uri is not whitelisted
```

## ✅ **Solution :**

### **1. Aller dans le Partner Dashboard Shopify :**
1. **Ouvrir https://partners.shopify.com/**
2. **Se connecter** avec votre compte
3. **Sélectionner l'app "INCONNU_OS"**

### **2. Configurer l'App setup :**

#### **App URL :**
```
https://inconnu-os-sea-production.up.railway.app
```

#### **Allowed redirection URL(s) :**
```
https://inconnu-os-sea-production.up.railway.app/api/shopify/callback
```

### **3. Scopes requis :**
- ✅ `read_products` - Lire les produits
- ✅ `read_inventory` - Lire l'inventaire
- ✅ `read_orders` - Lire les commandes

### **4. Sauvegarder et tester :**
1. **Cliquer sur "Save"**
2. **Attendre 1-2 minutes**
3. **Tester l'installation** sur une boutique

## 🧪 **Test après configuration :**

```bash
node test-shopify-config.js
```

**Résultat attendu :**
- ✅ Variables Shopify présentes
- ✅ Auth endpoint fonctionne
- ✅ Installation possible sur les boutiques

## 🎯 **URLs importantes :**

- **App URL** : `https://inconnu-os-sea-production.up.railway.app`
- **Redirect URI** : `https://inconnu-os-sea-production.up.railway.app/api/shopify/callback`
- **Client ID** : `757a707695544d8f0c88217b025553f5`

---

**Une fois configuré, l'erreur OAuth disparaîtra !** 🚀
