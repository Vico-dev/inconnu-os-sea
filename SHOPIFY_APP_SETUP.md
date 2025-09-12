# 🛍️ Configuration de l'App Shopify - INCONNU_OS

## 🚨 **Problème actuel :**
L'application Shopify "INCONNU_OS" est en cours de vérification et ne peut pas être installée sur des boutiques.

## 🔧 **Solutions pour les tests :**

### **Option 1 : Mode Développement (Recommandé)**

#### **1. Créer une App Shopify en mode développement**

1. **Aller sur le Shopify Partner Dashboard**
   - URL : https://partners.shopify.com/
   - Se connecter avec votre compte Shopify Partner

2. **Créer une nouvelle app**
   - Cliquer sur "Apps" → "Create app"
   - Choisir "Create app manually"
   - Nom : "INCONNU_OS"
   - Description : "Feed Manager et optimisation Google Shopping"

3. **Configurer l'app**
   - **App URL** : `https://inconnu-os-sea-production.up.railway.app`
   - **Allowed redirection URL(s)** : 
     - `https://inconnu-os-sea-production.up.railway.app/api/shopify/callback`
     - `https://inconnu-os-sea-production.up.railway.app/client/feed-manager`

4. **Configurer les scopes**
   - `read_products` - Lire les produits
   - `read_inventory` - Lire l'inventaire
   - `read_orders` - Lire les commandes

#### **2. Obtenir les identifiants**

1. **Dans l'onglet "App setup"**
   - Copier le **Client ID**
   - Copier le **Client secret**

2. **Ajouter les variables d'environnement dans Railway**
   ```env
   SHOPIFY_CLIENT_ID=your_client_id_here
   SHOPIFY_CLIENT_SECRET=your_client_secret_here
   SHOPIFY_REDIRECT_URI=https://inconnu-os-sea-production.up.railway.app/api/shopify/callback
   SHOPIFY_SCOPES=read_products,read_inventory,read_orders
   ```

#### **3. Tester l'installation**

1. **Créer une boutique de test**
   - Aller sur https://partners.shopify.com/
   - Créer une "Development store"

2. **Installer l'app**
   - URL d'installation : `https://inconnu-os-sea-production.up.railway.app/api/shopify/auth`
   - Ou utiliser le bouton "Test app" dans le Partner Dashboard

### **Option 2 : App publique (Pour la production)**

#### **1. Soumettre l'app à la review Shopify**

1. **Préparer l'app**
   - S'assurer que l'app fonctionne parfaitement
   - Tester toutes les fonctionnalités
   - Préparer la documentation

2. **Soumettre pour review**
   - Aller dans l'onglet "Distribution"
   - Cliquer sur "Submit for app store review"
   - Remplir tous les champs requis

3. **Attendre l'approbation**
   - Processus : 2-4 semaines
   - Shopify vérifie la sécurité et la conformité

## 🔍 **Vérification de la configuration actuelle**

### **Variables d'environnement manquantes :**
```bash
# Vérifier si ces variables sont définies dans Railway
echo $SHOPIFY_CLIENT_ID
echo $SHOPIFY_CLIENT_SECRET
echo $SHOPIFY_REDIRECT_URI
```

### **Test de l'API Shopify :**
```bash
# Tester l'endpoint d'authentification
curl -X POST https://inconnu-os-sea-production.up.railway.app/api/shopify/auth \
  -H "Content-Type: application/json" \
  -d '{"shop": "test-boutique"}'
```

## 🚀 **Actions immédiates recommandées :**

1. **✅ Créer une app Shopify en mode développement**
2. **✅ Configurer les variables d'environnement dans Railway**
3. **✅ Tester l'installation sur une boutique de test**
4. **✅ Vérifier que le feed manager peut se connecter à Shopify**

## 📋 **Checklist de configuration :**

- [ ] Compte Shopify Partner créé
- [ ] App "INCONNU_OS" créée en mode développement
- [ ] Variables d'environnement configurées dans Railway
- [ ] Boutique de test créée
- [ ] App installée et testée
- [ ] Feed manager fonctionne avec les données Shopify

## 🆘 **En cas de problème :**

1. **Vérifier les logs Railway** pour les erreurs d'authentification
2. **Tester l'URL d'authentification** manuellement
3. **Vérifier les scopes** de l'app Shopify
4. **S'assurer que l'URL de callback** est correcte

---

**Note :** Pour les tests immédiats, utilisez le mode développement. Pour la production, soumettez l'app à la review Shopify.
