# 🛍️ Guide de Configuration Google Merchant Center (GMC)

## 📋 **Prérequis**

### **1. Compte Google Merchant Center**
- Avoir un compte GMC actif
- Avoir configuré au moins un feed produit
- Avoir des permissions d'administrateur

### **2. Projet Google Cloud**
- Créer un projet dans Google Cloud Console
- Activer les APIs nécessaires
- Créer un compte de service

## 🚀 **Étapes de Configuration**

### **Étape 1 : Google Cloud Console**

1. **Créer un projet**
   ```
   https://console.cloud.google.com/
   ```

2. **Activer les APIs**
   - Content API for Shopping
   - Google Ads API
   - Google Analytics API

3. **Créer un compte de service**
   - IAM & Admin > Service Accounts
   - Créer un nouveau compte de service
   - Télécharger le fichier JSON de clé

### **Étape 2 : Configuration des Permissions**

1. **Dans Google Merchant Center**
   - Aller dans Paramètres > Comptes utilisateur
   - Ajouter l'email du compte de service
   - Donner les permissions "Administrateur"

2. **Dans Google Ads (si applicable)**
   - Aller dans Outils > Accès et sécurité
   - Ajouter l'email du compte de service
   - Donner les permissions "Administrateur"

### **Étape 3 : Variables d'Environnement**

Ajouter dans `.env.local` :

```env
# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Google Merchant Center
GMC_MERCHANT_ID=123456789
GMC_ACCOUNT_ID=123456789

# Google Ads (optionnel)
GOOGLE_ADS_CLIENT_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
```

### **Étape 4 : Configuration du Fichier de Service**

1. **Placer le fichier JSON**
   ```
   /path/to/service-account-key.json
   ```

2. **Vérifier les permissions**
   ```bash
   chmod 600 /path/to/service-account-key.json
   ```

## 🔧 **Test de Configuration**

### **Test Automatique**
```bash
npm run test:gmc
```

### **Test Manuel**
1. Aller dans Campaign Operator
2. Onglet Feed Manager
3. Cliquer sur "Synchroniser"

## 📊 **Structure des Custom Labels**

### **Custom Label 0 : Score Global**
```
score_8.5
```

### **Custom Label 1 : Performance**
```
performance_high
performance_medium
performance_low
```

### **Custom Label 2 : Recommandations**
```
Améliorer le titre du produit
Ajouter plus d'images
Optimiser la description
```

### **Custom Label 3 : Date d'Optimisation**
```
2024-01-15
```

### **Custom Label 4 : Version IA**
```
ai_v1.0
```

## 🚨 **Dépannage**

### **Erreur : "API GMC non initialisée"**
- Vérifier le fichier de service
- Vérifier les variables d'environnement
- Vérifier les permissions du compte de service

### **Erreur : "Access denied"**
- Vérifier les permissions dans GMC
- Vérifier les permissions dans Google Ads
- Vérifier les scopes de l'API

### **Erreur : "Quota exceeded"**
- Vérifier les quotas dans Google Cloud Console
- Réduire la fréquence des appels API
- Contacter le support Google

## 📈 **Optimisation**

### **Limites API**
- Content API : 1000 requêtes/minute
- Google Ads API : 10000 requêtes/jour
- Analytics API : 100000 requêtes/jour

### **Bonnes Pratiques**
- Mettre en cache les données
- Utiliser la pagination
- Gérer les erreurs de rate limiting
- Monitorer l'utilisation des quotas

## 🔐 **Sécurité**

### **Fichier de Service**
- Ne jamais commiter le fichier JSON
- Utiliser des variables d'environnement
- Limiter les permissions du compte de service

### **Permissions**
- Principe du moindre privilège
- Révoquer les permissions inutilisées
- Monitorer l'activité du compte de service

## 📞 **Support**

### **Documentation Officielle**
- [Content API for Shopping](https://developers.google.com/shopping-content)
- [Google Ads API](https://developers.google.com/google-ads/api)
- [Google Analytics API](https://developers.google.com/analytics)

### **Communauté**
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-merchant-center)
- [Google Ads Community](https://support.google.com/google-ads/community) 