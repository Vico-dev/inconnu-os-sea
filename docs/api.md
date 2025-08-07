# API Documentation - Inconnu OS

## Authentification

Toutes les routes API nécessitent une authentification via NextAuth.js.

### Headers requis
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints

### Tickets

#### GET /api/tickets
Récupère la liste des tickets de l'utilisateur connecté.

**Réponse :**
```json
{
  "tickets": [
    {
      "id": "string",
      "subject": "string",
      "description": "string",
      "status": "OPEN|IN_PROGRESS|RESOLVED|CLOSED",
      "priority": "LOW|MEDIUM|HIGH|URGENT",
      "category": "TECHNICAL|BILLING|OPTIMIZATION|ACCOUNT|OTHER",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/tickets
Crée un nouveau ticket.

**Body :**
```json
{
  "subject": "string (requis)",
  "description": "string (requis)",
  "priority": "LOW|MEDIUM|HIGH|URGENT (requis)",
  "category": "TECHNICAL|BILLING|OPTIMIZATION|ACCOUNT|OTHER (requis)"
}
```

**Réponse :**
```json
{
  "ticket": {
    "id": "string",
    "subject": "string",
    "description": "string",
    "status": "OPEN",
    "priority": "string",
    "category": "string",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Google Ads

#### GET /api/google-ads/auth
Redirige vers l'authentification Google OAuth.

#### GET /api/google-ads/callback
Callback pour l'authentification Google OAuth.

#### GET /api/google-ads/data
Récupère les données Google Ads connectées.

**Réponse :**
```json
{
  "connected": true,
  "accounts": [
    {
      "id": "string",
      "name": "string",
      "currency": "EUR"
    }
  ],
  "campaigns": [
    {
      "id": "string",
      "name": "string",
      "status": "ENABLED|PAUSED",
      "budget": 1000,
      "metrics": {
        "clicks": 150,
        "impressions": 5000,
        "cost": 250.50,
        "conversions": 5
      }
    }
  ]
}
```

### Stripe

#### POST /api/stripe/create-payment-intent
Crée une intention de paiement Stripe.

**Body :**
```json
{
  "amount": 19900,
  "currency": "eur",
  "plan": "PRO"
}
```

**Réponse :**
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

#### POST /api/stripe/webhook
Webhook Stripe pour les événements de paiement.

### Subscriptions

#### GET /api/subscription/status
Récupère le statut de l'abonnement.

**Réponse :**
```json
{
  "subscription": {
    "id": "string",
    "plan": "BASIC|PRO|ENTERPRISE",
    "status": "ACTIVE|CANCELLED|SUSPENDED",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "amount": 199,
    "currency": "EUR"
  }
}
```

#### POST /api/subscription/cancel
Annule l'abonnement actuel.

#### POST /api/subscription/change-plan
Change le plan d'abonnement.

**Body :**
```json
{
  "plan": "PRO|ENTERPRISE"
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

## Rate Limiting

- **Authentification** : 5 tentatives par 15 minutes
- **APIs générales** : 60 requêtes par minute
- **Tickets** : 10 tickets par minute
- **Paiements** : 5 paiements par minute

## Exemples d'utilisation

### JavaScript/TypeScript
```javascript
// Récupérer les tickets
const response = await fetch('/api/tickets', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

const { tickets } = await response.json()

// Créer un ticket
const newTicket = await fetch('/api/tickets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject: 'Problème technique',
    description: 'Ma campagne ne fonctionne plus',
    priority: 'HIGH',
    category: 'TECHNICAL'
  })
})
```

### cURL
```bash
# Récupérer les tickets
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     https://api.inconnu-os.com/api/tickets

# Créer un ticket
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"subject":"Test","description":"Test","priority":"MEDIUM","category":"TECHNICAL"}' \
     https://api.inconnu-os.com/api/tickets
``` 