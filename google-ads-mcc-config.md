# Configuration Google Ads MCC pour INCONNU OS

## Variables d'environnement à configurer sur Vercel :

```env
# Google Ads API - Configuration MCC
GOOGLE_ADS_CLIENT_ID="your-google-ads-client-id"
GOOGLE_ADS_CLIENT_SECRET="your-google-ads-client-secret"
GOOGLE_ADS_DEVELOPER_TOKEN="your-google-ads-developer-token"
GOOGLE_ADS_REDIRECT_URI="https://inconnu-os-orzsmgcv9-inconnus-projects-d4cd4b6a.vercel.app/api/google-ads/callback"
```

## Étapes de configuration Google Ads MCC :

### 1. Créer un projet Google Cloud
- Allez sur https://console.cloud.google.com/
- Créez un nouveau projet "INCONNU-OS-MCC"

### 2. Activer l'API Google Ads
- Dans "APIs & Services" > "Library"
- Recherchez "Google Ads API" et activez-la

### 3. Créer des identifiants OAuth 2.0
- Dans "APIs & Services" > "Credentials"
- "Create Credentials" > "OAuth 2.0 Client IDs"
- Type : "Web application"
- URIs de redirection autorisés :
  - `https://inconnu-os-orzsmgcv9-inconnus-projects-d4cd4b6a.vercel.app/api/google-ads/callback`

### 4. Obtenir un Developer Token
- Allez sur https://developers.google.com/google-ads/api/docs/first-call/dev-token
- Suivez les étapes pour obtenir votre Developer Token

### 5. Scopes OAuth requis
```
https://www.googleapis.com/auth/adwords
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

## Architecture MCC proposée :

### Connexion unique pour l'agence
- Un seul compte MCC connecté à l'application
- Accès à tous les comptes clients via le MCC
- Filtrage des données par client dans l'application

### Sécurité et isolation
- Chaque client ne voit que ses propres comptes Google Ads
- Permissions gérées au niveau application
- Audit trail centralisé

### Avantages
- ✅ Gestion centralisée
- ✅ Sécurité maximale
- ✅ Maintenance simplifiée
- ✅ Reporting consolidé 