# Documentation Technique - Intégration Google Ads
## Agence INCONNU - Plateforme de Gestion Client

---

## 1. Vue d'ensemble du projet

### 1.1 Description du projet
**Nom du projet :** INCONNU OS - Plateforme de Gestion Client  
**Type d'application :** Application web SaaS pour agence marketing  
**Technologies :** Next.js 15, TypeScript, PostgreSQL, Prisma ORM  
**Déploiement :** Architecture hybride (Frontend Vercel + Backend Railway)

### 1.2 Objectif principal
Développer une plateforme complète permettant aux agences marketing de :
- Gérer leurs clients et leurs comptes Google Ads
- Accéder aux données Google Ads via l'API officielle
- Analyser les performances des campagnes publicitaires
- Automatiser la génération de rapports
- Faciliter la gestion des permissions d'accès

---

## 2. Architecture technique

### 2.1 Stack technologique
```
Frontend :
- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS
- Radix UI Components
- NextAuth.js (Authentification)

Backend :
- Next.js API Routes
- Prisma ORM
- PostgreSQL (Railway)
- Google Ads API v20
- Google OAuth 2.0

Infrastructure :
- Vercel (Frontend)
- Railway (Backend + Database)
- Docker (Containerisation)
```

### 2.2 Architecture de déploiement
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - Next.js App   │    │ - API Routes    │    │ - User Data     │
│ - UI Components │    │ - Google Ads    │    │ - Permissions   │
│ - Auth Pages    │    │ - OAuth Flow    │    │ - Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 3. Intégration Google Ads API

### 3.1 Objectifs de l'intégration
1. **Accès MCC (My Client Center)** : Permettre à l'agence d'accéder aux comptes clients via un compte MCC centralisé
2. **Gestion des permissions** : Contrôler l'accès des clients à leurs propres comptes Google Ads
3. **Récupération de données** : Extraire les métriques de performance des campagnes
4. **Génération de rapports** : Automatiser la création de rapports personnalisés
5. **Synchronisation** : Maintenir les données à jour en temps réel

### 3.2 Flux d'authentification OAuth 2.0
```
1. Utilisateur clique sur "Connecter Google Ads"
2. Redirection vers Google OAuth
3. Autorisation des scopes nécessaires
4. Callback avec code d'autorisation
5. Échange contre access_token
6. Stockage sécurisé des tokens
7. Accès aux données Google Ads
```

### 3.3 Scopes Google Ads API requis
```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];
```

### 3.4 Endpoints API implémentés
```typescript
// Authentification
POST /api/google-ads/auth
POST /api/google-ads/callback

// Données MCC
GET /api/google-ads/mcc
POST /api/google-ads/mcc/permissions

// Synchronisation
GET /api/google-ads/sync
POST /api/google-ads/sync/campaigns

// Données client
GET /api/google-ads/data
GET /api/google-ads/data/campaigns
GET /api/google-ads/data/metrics
```

---

## 4. Fonctionnalités principales

### 4.1 Gestion des comptes MCC
- **Connexion MCC** : Authentification sécurisée avec le compte MCC de l'agence
- **Liste des comptes clients** : Affichage de tous les comptes Google Ads gérés
- **Gestion des permissions** : Contrôle granulaire des accès par client
- **Synchronisation automatique** : Mise à jour régulière des données

### 4.2 Interface d'administration
```typescript
// Composant principal d'administration
interface GoogleAdsPermissionsPage {
  permissions: GoogleAdsPermission[]
  clients: ClientAccount[]
  mccData: MCCData
  
  // Actions
  addPermission(permission: PermissionData): Promise<void>
  togglePermission(id: string, active: boolean): Promise<void>
  syncMCCData(): Promise<void>
}
```

### 4.3 Dashboard client
- **Vue d'ensemble** : Métriques principales des campagnes
- **Rapports personnalisés** : Génération automatique de rapports
- **Historique des performances** : Évolution des KPIs dans le temps
- **Alertes et notifications** : Notifications en temps réel

### 4.4 Sécurité et conformité
- **Chiffrement des tokens** : Stockage sécurisé des credentials
- **Permissions granulaires** : Contrôle d'accès par utilisateur
- **Audit trail** : Traçabilité des actions effectuées
- **Conformité RGPD** : Gestion des données personnelles

---

## 5. Modèles de données

### 5.1 Schéma de base de données
```sql
-- Table des permissions Google Ads
CREATE TABLE google_ads_permissions (
  id UUID PRIMARY KEY,
  client_account_id UUID NOT NULL,
  user_id UUID NOT NULL,
  google_ads_customer_id VARCHAR(255) NOT NULL,
  permissions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des tokens OAuth
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Types TypeScript
```typescript
interface GoogleAdsPermission {
  id: string
  clientAccountId: string
  userId: string
  googleAdsCustomerId: string
  permissions: {
    read: boolean
    write: boolean
    admin: boolean
  }
  isActive: boolean
  createdAt: string
}

interface MCCData {
  customerId: string
  customerName: string
  managerId: string
  testAccount: boolean
  accountStatus: string
}
```

---

## 6. Interface utilisateur

### 6.1 Page d'administration Google Ads
- **Liste des permissions** : Vue d'ensemble des accès configurés
- **Formulaire d'ajout** : Interface pour créer de nouvelles permissions
- **Contrôles de sécurité** : Activation/désactivation des accès
- **Statistiques MCC** : Métriques globales du compte MCC

### 6.2 Dashboard client
- **KPIs principaux** : Clics, impressions, conversions
- **Graphiques interactifs** : Évolution des performances
- **Filtres avancés** : Par campagne, période, réseau publicitaire
- **Export de données** : Génération de rapports PDF/Excel

### 6.3 Composants UI
```typescript
// Composants principaux
- GoogleAdsPermissionsPage
- MCCDashboard
- ClientGoogleAdsView
- PermissionForm
- MetricsChart
- ReportGenerator
```

---

## 7. Sécurité et bonnes pratiques

### 7.1 Authentification
- **OAuth 2.0** : Authentification sécurisée avec Google
- **JWT Tokens** : Gestion des sessions utilisateur
- **Refresh Tokens** : Renouvellement automatique des accès
- **Rate Limiting** : Protection contre les abus

### 7.2 Protection des données
- **Chiffrement** : Tokens stockés de manière sécurisée
- **Permissions** : Accès contrôlé par rôle utilisateur
- **Audit** : Logs de toutes les actions sensibles
- **Conformité** : Respect des réglementations RGPD

### 7.3 Monitoring
- **Health checks** : Vérification de l'état des services
- **Error tracking** : Surveillance des erreurs
- **Performance metrics** : Monitoring des temps de réponse
- **Usage analytics** : Statistiques d'utilisation

---

## 8. Tests et qualité

### 8.1 Tests unitaires
```typescript
// Tests des services Google Ads
describe('GoogleAdsMCCService', () => {
  test('should authenticate with MCC account')
  test('should list customer accounts')
  test('should manage permissions')
  test('should sync data')
})
```

### 8.2 Tests d'intégration
- **Tests OAuth** : Validation du flux d'authentification
- **Tests API** : Vérification des endpoints
- **Tests UI** : Validation des interfaces utilisateur
- **Tests de sécurité** : Contrôle des vulnérabilités

---

## 9. Déploiement et maintenance

### 9.1 Pipeline CI/CD
```
GitHub → Tests → Build → Deploy
  ↓        ↓       ↓       ↓
  Code   Linting  Docker  Railway
```

### 9.2 Variables d'environnement
```bash
# Google Ads API
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_REDIRECT_URI=https://your-domain.com/api/google-ads/callback

# Base de données
DATABASE_URL=postgresql://...

# Authentification
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-domain.com
```

### 9.3 Monitoring en production
- **Logs applicatifs** : Traçabilité des erreurs
- **Métriques de performance** : Temps de réponse, utilisation CPU
- **Alertes** : Notifications en cas de problème
- **Backup** : Sauvegarde automatique des données

---

## 10. Roadmap et évolutions

### 10.1 Fonctionnalités futures
- **API publique** : Documentation et SDK pour développeurs
- **Intégrations tierces** : Connexion avec d'autres plateformes
- **IA et ML** : Prédiction des performances et optimisation automatique
- **Mobile app** : Application mobile native

### 10.2 Optimisations prévues
- **Cache intelligent** : Mise en cache des données fréquemment utilisées
- **CDN** : Distribution géographique du contenu
- **Microservices** : Architecture modulaire évolutive
- **Real-time** : Mise à jour en temps réel des données

---

## 11. Support et documentation

### 11.1 Documentation utilisateur
- **Guide d'utilisation** : Tutoriels pas à pas
- **FAQ** : Questions fréquemment posées
- **Vidéos** : Démonstrations en vidéo
- **Support** : Chat et tickets d'assistance

### 11.2 Documentation technique
- **API Reference** : Documentation complète des endpoints
- **Architecture** : Schémas détaillés de l'infrastructure
- **Contributing** : Guide pour les contributeurs
- **Changelog** : Historique des versions

---

## 12. Conclusion

Cette plateforme représente une solution complète pour la gestion des comptes Google Ads en agence marketing. L'intégration de l'API Google Ads permet d'automatiser de nombreuses tâches manuelles et d'améliorer significativement l'efficacité opérationnelle.

L'architecture moderne et évolutive garantit la scalabilité et la maintenabilité du projet, tandis que les mesures de sécurité assurent la protection des données sensibles des clients.

**Contact :** victor@agence-inconnu.fr  
**Site web :** https://agence-inconnu.fr  
**GitHub :** https://github.com/Vico-dev/inconnu-os-sea

---

*Document généré le : ${new Date().toLocaleDateString('fr-FR')}*  
*Version : 1.0* 