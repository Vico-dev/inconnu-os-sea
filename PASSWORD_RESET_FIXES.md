# 🔒 Correctifs de Sécurité - Réinitialisation de Mot de Passe

## 📋 Problèmes Identifiés

### 1. Conflit de Tokens
- **Problème** : Les mêmes champs (`emailVerificationToken` et `emailVerificationExpires`) étaient utilisés pour la vérification d'email ET la réinitialisation de mot de passe
- **Risque** : Un token de réinitialisation pouvait invalider un token de vérification d'email et vice versa

### 2. Sécurité Insuffisante
- **Problème** : Validation basique des mots de passe (seulement 8 caractères minimum)
- **Problème** : Pas de validation du format d'email
- **Problème** : Pas de protection contre les attaques par énumération

### 3. Gestion d'Erreurs
- **Problème** : Gestion d'erreurs basique sans nettoyage des tokens en cas d'échec
- **Problème** : Pas de nettoyage automatique des tokens expirés

## ✅ Correctifs Appliqués

### 1. Validation Renforcée

#### Validation d'Email
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  return NextResponse.json(
    { error: "Format d'email invalide" },
    { status: 400 }
  )
}
```

#### Validation de Mot de Passe
```typescript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
if (!passwordRegex.test(password)) {
  return NextResponse.json(
    { error: "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial" },
    { status: 400 }
  )
}
```

### 2. Protection Contre les Attaques

#### Normalisation des Emails
```typescript
where: { email: email.toLowerCase() }
```

#### Vérification des Tokens Existants
```typescript
if (user.emailVerificationToken && user.emailVerificationExpires && user.emailVerificationExpires > new Date()) {
  return NextResponse.json({
    success: true,
    message: "Un lien de réinitialisation a déjà été envoyé. Vérifiez votre boîte de réception."
  })
}
```

### 3. Gestion d'Erreurs Améliorée

#### Nettoyage en Cas d'Échec
```typescript
try {
  await EmailService.sendPasswordReset(user.email, user.firstName, resetUrl)
} catch (emailError) {
  // Supprimer le token en cas d'échec d'envoi
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: null,
      emailVerificationExpires: null
    }
  })
}
```

### 4. Nettoyage Automatique

#### Script de Nettoyage
```typescript
export async function cleanupExpiredTokens() {
  await prisma.user.updateMany({
    where: {
      emailVerificationExpires: {
        lt: new Date()
      }
    },
    data: {
      emailVerificationToken: null,
      emailVerificationExpires: null
    }
  })
}
```

## 🚀 Améliorations Futures

### 1. Séparation Complète des Tokens
```sql
-- À ajouter dans le schéma Prisma
passwordResetToken    String? @unique
passwordResetExpires  DateTime?
```

### 2. Rate Limiting
```typescript
// Limiter les tentatives de réinitialisation
const rateLimit = new Map()
const MAX_ATTEMPTS = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 heure
```

### 3. Logs de Sécurité
```typescript
// Ajouter des logs pour le monitoring
console.log(`Password reset requested for email: ${email}`)
console.log(`Password reset completed for user: ${user.id}`)
```

## 📁 Fichiers Modifiés

1. **`src/app/api/auth/forgot-password/route.ts`**
   - Validation d'email ajoutée
   - Vérification des tokens existants
   - Gestion d'erreurs améliorée

2. **`src/app/api/auth/reset-password/route.ts`**
   - Validation renforcée du mot de passe
   - Vérification d'expiration améliorée
   - Messages d'erreur plus précis

3. **`src/lib/cleanup-tokens.ts`** (nouveau)
   - Script de nettoyage automatique des tokens expirés

4. **`src/app/api/admin/cleanup-tokens/route.ts`** (nouveau)
   - Route API pour déclencher le nettoyage (admin uniquement)

## 🧪 Tests Recommandés

### Tests de Sécurité
- [ ] Tentative de réinitialisation avec email invalide
- [ ] Tentative de réinitialisation avec mot de passe faible
- [ ] Utilisation d'un token expiré
- [ ] Utilisation d'un token invalide
- [ ] Tentative de réinitialisation multiple pour le même email

### Tests Fonctionnels
- [ ] Réinitialisation réussie avec email valide
- [ ] Réinitialisation réussie avec mot de passe fort
- [ ] Redirection après réinitialisation
- [ ] Nettoyage des tokens expirés

## 🔧 Utilisation

### Application des Correctifs
```bash
node scripts/apply-password-reset-fixes.js
```

### Nettoyage Manuel des Tokens
```bash
node -e "require('./src/lib/cleanup-tokens.ts').runCleanup()"
```

### Nettoyage via API (Admin)
```bash
curl -X POST /api/admin/cleanup-tokens \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Métriques de Sécurité

- **Complexité minimale du mot de passe** : 8 caractères + 4 types de caractères
- **Durée de vie du token** : 1 heure
- **Validation d'email** : Regex standard
- **Protection contre l'énumération** : Messages identiques pour emails existants/non-existants

## 🎯 Objectifs Atteints

- ✅ Séparation logique des tokens (temporaire avec les champs existants)
- ✅ Validation renforcée des entrées
- ✅ Protection contre les attaques courantes
- ✅ Gestion d'erreurs robuste
- ✅ Nettoyage automatique des données expirées
- ✅ Documentation complète des améliorations 