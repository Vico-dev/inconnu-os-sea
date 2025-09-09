# 🚀 Guide de Setup Google Merchant Center API

## 📋 Prérequis

- Compte Google (Gmail)
- Accès à Google Cloud Console
- Compte Google Merchant Center

## 🔧 Étape 1: Configuration Google Cloud

### 1.1 Créer un projet Google Cloud
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquer sur "Sélectionner un projet" → "Nouveau projet"
3. Nommer le projet (ex: "inconnu-gmc-api")
4. Cliquer sur "Créer"

### 1.2 Activer l'API Merchant Center
1. Dans le menu, aller à "APIs & Services" → "Library"
2. Rechercher "Merchant Center API"
3. Cliquer sur "Merchant Center API"
4. Cliquer sur "Activer"

### 1.3 Créer un compte de service
1. Aller à "APIs & Services" → "Credentials"
2. Cliquer sur "Create Credentials" → "Service Account"
3. Remplir les informations :
   - Nom : "gmc-export-service"
   - Description : "Service d'export vers Google Merchant Center"
4. Cliquer sur "Create and Continue"
5. Pour les rôles, sélectionner "Editor" (ou créer un rôle personnalisé)
6. Cliquer sur "Continue" puis "Done"

### 1.4 Générer la clé JSON
1. Cliquer sur le compte de service créé
2. Aller à l'onglet "Keys"
3. Cliquer sur "Add Key" → "Create new key"
4. Sélectionner "JSON"
5. Télécharger le fichier JSON
6. **IMPORTANT** : Placer ce fichier dans le projet et ajouter le chemin dans `.env`

## 🔗 Étape 2: Configuration Google Merchant Center

### 2.1 Accéder à GMC
1. Aller sur [Google Merchant Center](https://merchants.google.com/)
2. Se connecter avec le compte Google

### 2.2 Lier le compte de service
1. Dans GMC, aller à "Settings" → "Users"
2. Cliquer sur "Add user"
3. Ajouter l'email du compte de service (format: `nom@projet.iam.gserviceaccount.com`)
4. Rôle : "Standard user" ou "Admin" selon les besoins
5. Cliquer sur "Add user"

### 2.3 Récupérer le Merchant ID
1. Dans GMC, aller à "Settings" → "Account"
2. Le Merchant ID est affiché en haut de la page
3. **Notez ce numéro** - il sera utilisé dans l'application

## ⚙️ Étape 3: Configuration de l'application

### 3.1 Variables d'environnement
Ajouter dans le fichier `.env` :

```bash
# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# GMC
GMC_DEFAULT_MERCHANT_ID=your-merchant-id
SHOPIFY_STORE_URL=https://your-store.myshopify.com
```

### 3.2 Structure des dossiers
```
src/
├── lib/
│   ├── gmc-service.ts      # Service principal GMC
│   ├── gmc-config.ts       # Configuration et mapping
│   └── google-auth.ts      # Authentification Google
├── app/
│   └── api/
│       └── gmc/
│           └── export/
│               └── route.ts # Route d'export
└── components/
    └── admin/
        └── GMCExportButton.tsx # Composant d'export
```

## 🧪 Étape 4: Test de l'API

### 4.1 Test local
```bash
# Démarrer l'application
npm run dev

# Dans un autre terminal, lancer le test
node test-gmc-api.js
```

### 4.2 Test avec de vrais produits
1. Aller sur `/admin/feed-manager`
2. Sélectionner une boutique Shopify
3. Cliquer sur "Export GMC"
4. Saisir le Merchant ID
5. Cliquer sur "Exporter"

## 🔍 Étape 5: Monitoring et Debug

### 5.1 Logs de l'application
- Vérifier les logs dans la console
- Les erreurs d'export sont affichées dans l'interface

### 5.2 Vérification dans GMC
1. Aller dans GMC → "Products"
2. Vérifier que les produits sont bien importés
3. Vérifier les statuts et erreurs éventuelles

### 5.3 API Status
- Route GET `/api/gmc/export?merchantId=XXX` pour vérifier le statut
- Retourne la liste des produits exportés

## 🚨 Dépannage

### Erreur d'authentification
- Vérifier que le fichier JSON est bien placé
- Vérifier que le compte de service a accès à GMC
- Vérifier que l'API est activée

### Erreur d'export
- Vérifier le format des produits Shopify
- Vérifier que tous les champs requis sont présents
- Vérifier les limites de l'API (1000 produits par batch)

### Produits non visibles dans GMC
- Vérifier que le Merchant ID est correct
- Vérifier que les produits respectent les règles GMC
- Attendre quelques minutes pour la synchronisation

## 📚 Ressources utiles

- [Documentation GMC API](https://developers.google.com/shopping-content/guides/quickstart)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Merchant Center](https://merchants.google.com/)
- [Limites de l'API](https://developers.google.com/shopping-content/guides/quotas)

## 🎯 Prochaines étapes

1. **Test en production** avec de vrais produits
2. **Optimisation des performances** (parallélisation des exports)
3. **Monitoring avancé** (métriques d'export, alertes)
4. **Gestion des erreurs** (retry automatique, fallback)
5. **Interface d'administration** (gestion des comptes GMC) 