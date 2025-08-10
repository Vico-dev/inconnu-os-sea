# 🎯 Configuration Google Ads API - Guide Complet

## 📋 Prérequis

### 1. Compte Google Ads
- ✅ Compte Google Ads actif
- ✅ Accès administrateur au compte
- ✅ Compte MCC (My Client Center) pour l'agence

### 2. Projet Google Cloud
- ✅ Projet Google Cloud créé
- ✅ API Google Ads activée
- ✅ Identifiants OAuth 2.0 configurés

## 🔧 Configuration Google Cloud

### Étape 1 : Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet : `INCONNU-OS-GOOGLE-ADS`
3. Sélectionnez le projet

### Étape 2 : Activer l'API Google Ads
1. Dans "APIs & Services" > "Library"
2. Recherchez "Google Ads API"
3. Cliquez sur "Enable"

### Étape 3 : Créer les identifiants OAuth 2.0
1. Dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
3. Sélectionnez "Web application"
4. Nom : `INCONNU-OS-GOOGLE-ADS-CLIENT`
5. URIs de redirection autorisés :
   ```
   http://localhost:3000/api/google-ads/callback
   https://inconnu-os-sea-production.up.railway.app/api/google-ads/callback
   ```

### Étape 4 : Obtenir le Developer Token
1. Allez sur [Google Ads API Developer Token](https://developers.google.com/google-ads/api/docs/first-call/dev-token)
2. Suivez les étapes pour obtenir votre Developer Token
3. **Important** : Le Developer Token peut prendre 24-48h pour être approuvé

## 🔑 Variables d'environnement

### Variables à configurer sur Railway :

```env
# Google Ads API
GOOGLE_ADS_CLIENT_ID="your-google-ads-client-id"
GOOGLE_ADS_CLIENT_SECRET="your-google-ads-client-secret"
GOOGLE_ADS_DEVELOPER_TOKEN="your-google-ads-developer-token"
GOOGLE_ADS_REDIRECT_URI="https://inconnu-os-sea-production.up.railway.app/api/google-ads/callback"
```

### Où trouver ces valeurs :
- **CLIENT_ID** : Google Cloud Console > Credentials > OAuth 2.0 Client IDs
- **CLIENT_SECRET** : Google Cloud Console > Credentials > OAuth 2.0 Client IDs
- **DEVELOPER_TOKEN** : Google Ads API Developer Token page
- **REDIRECT_URI** : URL de production de votre application

## 🚀 Test de l'intégration

### 1. Test de connexion OAuth
1. Connectez-vous à l'application
2. Allez dans `/client/connect-google-ads`
3. Cliquez sur "Connecter Google Ads"
4. Autorisez l'application dans Google
5. Vérifiez la redirection vers `/client?success=google_ads_connected`

### 2. Test de récupération des données
1. Une fois connecté, allez dans `/client/google-ads`
2. Vérifiez que les comptes Google Ads s'affichent
3. Testez la synchronisation des campagnes

### 3. Test des permissions MCC
1. Connectez-vous en tant qu'admin
2. Allez dans `/admin/google-ads-permissions`
3. Testez l'ajout de permissions pour un client

## 📊 Fonctionnalités disponibles

### ✅ Authentification OAuth 2.0
- Connexion sécurisée avec Google
- Stockage des tokens de rafraîchissement
- Gestion automatique de l'expiration

### ✅ Gestion MCC (My Client Center)
- Accès centralisé aux comptes clients
- Gestion des permissions par client
- Isolation des données par client

### ✅ Récupération de données
- Campagnes Google Ads
- Métriques de performance
- Données de conversion

### ✅ Interface utilisateur
- Page de connexion Google Ads
- Dashboard des campagnes
- Gestion des permissions

## 🔍 Dépannage

### Erreur "Developer Token not approved"
- Le Developer Token peut prendre 24-48h pour être approuvé
- Vérifiez le statut sur la page Developer Token

### Erreur "Invalid redirect URI"
- Vérifiez que l'URI de redirection est exactement configuré dans Google Cloud
- Assurez-vous que l'URL de production est correcte

### Erreur "Access denied"
- Vérifiez que l'API Google Ads est activée
- Vérifiez que les scopes OAuth sont corrects

### Erreur "No accounts found"
- Vérifiez que le compte Google Ads a des campagnes actives
- Vérifiez les permissions du compte MCC

## 📈 Prochaines étapes

### 1. Optimisations
- [ ] Cache des données Google Ads
- [ ] Synchronisation automatique
- [ ] Alertes de performance

### 2. Fonctionnalités avancées
- [ ] Création/modification de campagnes
- [ ] Optimisation automatique
- [ ] Rapports personnalisés

### 3. Intégrations
- [ ] Google Analytics 4
- [ ] Google Tag Manager
- [ ] Google My Business

## 🛡️ Sécurité

### Bonnes pratiques
- ✅ Tokens stockés de manière sécurisée
- ✅ Permissions granulaires par client
- ✅ Audit trail des accès
- ✅ Chiffrement des données sensibles

### Monitoring
- ✅ Logs des connexions Google Ads
- ✅ Surveillance des erreurs API
- ✅ Alertes de sécurité

---

## 🎯 Test rapide

Pour tester rapidement l'intégration :

1. **Configurez les variables d'environnement** sur Railway
2. **Déployez l'application** avec `git push`
3. **Testez la connexion** via `/client/connect-google-ads`
4. **Vérifiez les logs** avec `railway logs`

L'intégration Google Ads API est maintenant prête à être utilisée ! 🚀 