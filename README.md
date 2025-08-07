# Inconnu OS - Plateforme de Gestion SEA

Plateforme complète pour la gestion d'activité freelance SEA, permettant de gérer la vie d'un client de A à Z, de l'acquisition du lead à la facturation.

## 🚀 Fonctionnalités

### Front Public (agence-inconnu.fr)
- Page d'accueil moderne avec présentation des services
- Formulaire de souscription en ligne
- Tarification transparente
- Design responsive et professionnel

### Espace Client
- **Dashboard** : Vue d'ensemble des performances
- **Reporting** : Métriques en temps réel des campagnes Google Ads
- **Factures** : Consultation et téléchargement des factures
- **Support** : Création et suivi des tickets
- **Rendez-vous** : Planification de RDV avec l'Account Manager

### Espace Admin/Account Manager
- **Gestion des clients** : Suivi des comptes assignés
- **Activités** : Enregistrement des actions réalisées
- **Tickets** : Gestion et réponse aux demandes clients
- **Facturation** : Création et suivi des factures
- **Reporting** : Métriques globales et performances

### Intégration Google Ads
- Connexion directe aux comptes Google Ads des clients
- Récupération des métriques en temps réel
- Reporting automatisé
- Optimisation des campagnes

## 🛠️ Technologies

- **Frontend** : Next.js 15, React 19, TypeScript
- **UI** : Tailwind CSS, Radix UI, Lucide React
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : NextAuth.js
- **Paiements** : Stripe
- **Google Ads** : Google Ads API
- **Charts** : Recharts
- **Forms** : React Hook Form + Zod
- **Tests** : Jest, React Testing Library, Playwright
- **CI/CD** : GitHub Actions
- **Containerisation** : Docker

## 📦 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/inconnu-os-sea.git
cd inconnu-os-sea
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp env.example .env.local
```

Remplir les variables d'environnement dans `.env.local` :
```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/inconnu_os"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google Ads API
GOOGLE_ADS_CLIENT_ID="your-google-ads-client-id"
GOOGLE_ADS_CLIENT_SECRET="your-google-ads-client-secret"
GOOGLE_ADS_DEVELOPER_TOKEN="your-google-ads-developer-token"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Rate Limiting
REDIS_URL="redis://localhost:6379"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

4. **Configuration de la base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# (Optionnel) Seeder pour les données de test
npx prisma db seed
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🧪 Tests

### Tests Unitaires
```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage
```

### Tests E2E
```bash
# Installer Playwright
npx playwright install

# Lancer les tests E2E
npm run test:e2e
```

### Tests de Sécurité
```bash
# Audit des dépendances
npm audit

# Audit avec niveau critique
npm audit --audit-level critical
```

## 🐳 Docker

### Développement
```bash
# Démarrer avec Docker Compose
docker-compose up -d

# Voir les logs
docker-compose logs -f app
```

### Production
```bash
# Build de l'image
docker build -t inconnu-os .

# Lancer le conteneur
docker run -p 3000:3000 inconnu-os
```

## 🚀 Déploiement

### Script de Déploiement
```bash
# Déploiement staging
./scripts/deploy.sh staging

# Déploiement production
./scripts/deploy.sh production
```

### Vercel (Recommandé)
```bash
npm run build
vercel --prod
```

### GitHub Actions
Le projet inclut un pipeline CI/CD complet :
- Tests automatiques
- Audit de sécurité
- Déploiement staging/production
- Rollback automatique

## 📊 Monitoring et Observabilité

### Métriques
- Performance des pages
- Temps de réponse des APIs
- Utilisation des ressources
- Erreurs et exceptions

### Logs
- Logs structurés
- Centralisation avec ELK Stack
- Alertes automatiques

### Santé de l'Application
```bash
# Endpoint de santé
curl http://localhost:3000/api/health
```

## 🔒 Sécurité

### Authentification
- NextAuth.js avec JWT
- Sessions sécurisées
- Rate limiting
- Protection CSRF

### Headers de Sécurité
- HSTS
- CSP
- X-Frame-Options
- X-Content-Type-Options

### Validation
- Zod pour la validation des données
- Sanitisation des entrées
- Protection contre les injections

## 📚 Documentation

### API
Voir [docs/api.md](docs/api.md) pour la documentation complète de l'API.

### Architecture
- [Structure de la base de données](prisma/schema.prisma)
- [Configuration Next.js](next.config.ts)
- [Workflow CI/CD](.github/workflows/ci.yml)

## 🗄️ Structure de la Base de Données

### Modèles Principaux

- **User** : Utilisateurs (Admin, Account Manager, Client)
- **ClientAccount** : Comptes clients avec plan d'abonnement
- **AccountManager** : Account Managers assignés aux clients
- **Campaign** : Campagnes Google Ads
- **Activity** : Activités réalisées par les AM
- **Ticket** : Tickets de support
- **Invoice** : Factures
- **Appointment** : Rendez-vous

## 🔧 Configuration Google Ads

1. Créer un projet Google Cloud
2. Activer l'API Google Ads
3. Créer des identifiants OAuth 2.0
4. Obtenir un Developer Token
5. Configurer les variables d'environnement

## 📊 Fonctionnalités Avancées

### Reporting en Temps Réel
- Métriques Google Ads automatiques
- Graphiques interactifs
- Export PDF/Excel
- Alertes personnalisées

### Automatisation
- Optimisation automatique des campagnes
- Rapports hebdomadaires/mensuels
- Notifications par email
- Intégration webhook

### Sécurité
- Authentification multi-facteurs
- Chiffrement des données sensibles
- Audit trail complet
- Conformité RGPD

## 📝 Scripts Disponibles

```bash
npm run dev          # Développement
npm run build        # Production build
npm run start        # Démarrer en production
npm run lint         # Linter
npm run test         # Tests unitaires
npm run test:e2e     # Tests E2E
npm run db:push      # Mettre à jour la DB
npm run db:studio    # Ouvrir Prisma Studio
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de Code
- ESLint pour le linting
- Prettier pour le formatage
- Tests obligatoires pour les nouvelles fonctionnalités
- Documentation mise à jour

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Email : contact@agence-inconnu.fr
- Site web : https://agence-inconnu.fr
- Documentation : [docs/](docs/)

---

**Inconnu OS** - La plateforme de gestion SEA pour les freelances et agences.

## 🎯 Roadmap

### Prochaines Fonctionnalités
- [ ] Intégration Google Analytics 4
- [ ] Dashboard de performance avancé
- [ ] Système de notifications push
- [ ] API publique pour intégrations
- [ ] Application mobile React Native
- [ ] Intelligence artificielle pour l'optimisation
- [ ] Intégration avec d'autres plateformes publicitaires
