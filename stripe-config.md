# Configuration Stripe

## Variables d'environnement à ajouter dans `.env.local` :

```env
# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"
```

## Configuration Stripe :

1. **Créer un compte Stripe** : https://dashboard.stripe.com/register

2. **Récupérer les clés API** :
   - Allez dans Dashboard > Developers > API keys
   - Copiez les clés de test (commençant par `sk_test_` et `pk_test_`)

3. **Configurer les webhooks** :
   - Allez dans Dashboard > Developers > Webhooks
   - Créez un endpoint : `https://votre-domaine.com/api/stripe/webhook`
   - Sélectionnez les événements :
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. **Récupérer le secret webhook** :
   - Dans l'endpoint créé, copiez le "Signing secret"

## Modes de paiement supportés :

- **Cartes bancaires** : Visa, Mastercard, American Express
- **Prélèvements SEPA** : Pour les comptes bancaires européens

## Test en développement :

Utilisez les cartes de test Stripe :
- `4242 4242 4242 4242` (succès)
- `4000 0000 0000 0002` (décliné)
- `4000 0000 0000 9995` (insuffisant) 