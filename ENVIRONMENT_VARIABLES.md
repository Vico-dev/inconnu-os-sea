# 🔧 Variables d'Environnement - Inconnu OS

## 🚀 **Variables CRITIQUES pour le Campaign Operator**

### **Google Ads API**
```env
GOOGLE_ADS_CLIENT_ID=your_google_ads_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_ads_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_google_ads_developer_token
GOOGLE_ADS_REDIRECT_URI=https://your-domain.com/api/google-ads/callback
```

### **OpenAI API**
```env
OPENAI_API_KEY=your_openai_api_key
```

### **Google Merchant Center (GMC)**
```env
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_key.json
```

### **Shopify App**
```env
SHOPIFY_CLIENT_ID=your_shopify_app_client_id
SHOPIFY_CLIENT_SECRET=your_shopify_app_client_secret
SHOPIFY_REDIRECT_URI=https://your-domain.com/api/shopify/callback
SHOPIFY_SCOPES=read_products,read_inventory,read_orders
```

## 📧 **Email & Notifications**

### **Resend (Email Service)**
```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=Agence Inconnu <noreply@your-domain.com>
```

## 💳 **Paiements - Stripe**

### **Stripe Configuration**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Stripe Price IDs**
```env
STRIPE_PRICE_SMALL_BUDGET=price_...
STRIPE_PRICE_MEDIUM_BUDGET=price_...
STRIPE_PRICE_LARGE_BUDGET=price_...
```

## 🔐 **Authentification**

### **NextAuth.js**
```env
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

## 🗄️ **Base de Données**

### **PostgreSQL**
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

## 🔄 **Cron Jobs**

### **Tâches Automatiques**
```env
CRON_SECRET_KEY=your_cron_secret_key
```

## 🌐 **URLs & Domaines**

### **Railway (Déploiement)**
```env
RAILWAY_STATIC_URL=https://your-app.railway.app
RAILWAY_PUBLIC_DOMAIN=your-app.railway.app
```

## 📊 **Monitoring & Logs**

### **Sentry (Optionnel)**
```env
SENTRY_DSN=your_sentry_dsn
```

### **Logs**
```env
LOG_LEVEL=info
```

## 🎯 **Configuration Spécifique**

### **Clés Personnalisées**
```env
CUSTOM_KEY=your_custom_key
```

---

## 🚨 **PRIORITÉS pour Mise en Ligne**

### **Phase 1 - CRITIQUE** ✅
- [x] `OPENAI_API_KEY` - **AJOUTÉ**
- [ ] `GOOGLE_ADS_CLIENT_ID`
- [ ] `GOOGLE_ADS_CLIENT_SECRET` 
- [ ] `GOOGLE_ADS_DEVELOPER_TOKEN`
- [ ] `GOOGLE_ADS_REDIRECT_URI`

### **Phase 2 - IMPORTANT**
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` (GMC)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`

### **Phase 3 - OPTIONNEL**
- [ ] `SENTRY_DSN`
- [ ] `CRON_SECRET_KEY`

---

## 📝 **Instructions d'Installation**

### **1. Google Ads API**
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un existant
3. Activer l'API Google Ads
4. Créer des identifiants OAuth 2.0
5. Obtenir le Developer Token depuis Google Ads

### **2. OpenAI API**
1. Aller sur [OpenAI Platform](https://platform.openai.com/)
2. Créer un compte et obtenir une clé API
3. Ajouter la clé dans Railway

### **3. Google Merchant Center**
1. Créer un compte Google Merchant Center
2. Créer un compte de service dans Google Cloud
3. Télécharger le fichier JSON des clés
4. Configurer les permissions

---

## 🔍 **Vérification de Configuration**

Utilisez l'endpoint `/api/debug/database` pour vérifier la configuration :

```bash
curl https://your-domain.com/api/debug/database
```

---

**Status** : 🚀 **EN CONFIGURATION** 