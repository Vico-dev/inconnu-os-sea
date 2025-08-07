# Configuration Google Ads API

## Variables d'environnement à ajouter dans `.env.local` :

```env
# Google Ads API
GOOGLE_ADS_CLIENT_ID="your-google-ads-client-id"
GOOGLE_ADS_CLIENT_SECRET="your-google-ads-client-secret"
GOOGLE_ADS_DEVELOPER_TOKEN="your-google-ads-developer-token"
GOOGLE_ADS_REDIRECT_URI="http://localhost:3000/api/google-ads/callback"
```

## Configuration Google Ads API :

1. **Créer un projet Google Cloud** :
   - Allez sur https://console.cloud.google.com/
   - Créez un nouveau projet ou sélectionnez un existant

2. **Activer l'API Google Ads** :
   - Dans la console Google Cloud, allez dans "APIs & Services" > "Library"
   - Recherchez "Google Ads API" et activez-la

3. **Créer des identifiants OAuth 2.0** :
   - Allez dans "APIs & Services" > "Credentials"
   - Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
   - Sélectionnez "Web application"
   - Ajoutez les URIs de redirection autorisés :
     - `http://localhost:3000/api/google-ads/callback` (développement)
     - `https://votre-domaine.com/api/google-ads/callback` (production)

4. **Obtenir un Developer Token** :
   - Allez sur https://developers.google.com/google-ads/api/docs/first-call/dev-token
   - Suivez les étapes pour obtenir votre Developer Token

5. **Configurer les scopes OAuth** :
   - `https://www.googleapis.com/auth/adwords` - Accès aux données Google Ads
   - `https://www.googleapis.com/auth/userinfo.email` - Email de l'utilisateur
   - `https://www.googleapis.com/auth/userinfo.profile` - Profil de l'utilisateur

## Fonctionnalités implémentées :

### **1. Authentification OAuth 2.0** :
- ✅ **Génération d'URL d'autorisation** (`/api/google-ads/auth`)
- ✅ **Gestion du callback** (`/api/google-ads/callback`)
- ✅ **Stockage des tokens** dans la base de données
- ✅ **Récupération des comptes** Google Ads accessibles

### **2. Interface utilisateur** :
- ✅ **Page de connexion** (`/client/connect-google-ads`)
- ✅ **Banner dans le dashboard** pour encourager la connexion
- ✅ **Messages de succès/erreur** avec gestion des erreurs
- ✅ **Design moderne** avec icônes et animations

### **3. Base de données** :
- ✅ **Modèle GoogleAdsConnection** pour stocker les tokens
- ✅ **Champ googleAdsConnected** dans ClientAccount
- ✅ **Relations** entre User et GoogleAdsConnection

## Prochaines étapes :

1. **Récupération des données** :
   - Implémenter la récupération des campagnes
   - Afficher les métriques en temps réel
   - Créer des graphiques de performance

2. **Optimisations** :
   - Suggestions d'optimisation automatiques
   - Alertes de performance
   - Rapports personnalisés

3. **Gestion des comptes** :
   - Sélection du compte Google Ads principal
   - Gestion de plusieurs comptes
   - Synchronisation des données

## Test en développement :

1. Configurez les variables d'environnement
2. Lancez le serveur : `npm run dev`
3. Connectez-vous à votre compte client
4. Cliquez sur "Connecter Google Ads"
5. Autorisez l'accès via Google OAuth
6. Vérifiez la connexion dans le dashboard

## Sécurité :

- ✅ **Tokens chiffrés** en base de données
- ✅ **Scopes limités** aux données nécessaires
- ✅ **Révocation possible** depuis Google
- ✅ **Pas de stockage** de mots de passe 