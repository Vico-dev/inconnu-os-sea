import { NextRequest, NextResponse } from 'next/server'

// Stockage en mémoire pour le rate limiting (en production, utilisez Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // Fenêtre de temps en millisecondes
  maxRequests: number // Nombre maximum de requêtes
  message?: string // Message d&apos;erreur personnalisé
}

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Nettoyer les anciennes entrées
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }

    // Vérifier les limites pour cette IP
    const key = `${ip}:${request.nextUrl.pathname}`
    const current = rateLimitStore.get(key)

    if (!current || current.resetTime < now) {
      // Première requête ou fenêtre expirée
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Pas de limite atteinte
    }

    if (current.count >= config.maxRequests) {
      // Limite atteinte
      const response = NextResponse.json(
        {
          error: config.message || 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { status: 429 }
      )

      // Headers de rate limiting
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', new Date(current.resetTime).toISOString())
      response.headers.set('Retry-After', Math.ceil((current.resetTime - now) / 1000).toString())

      return response
    }

    // Incrémenter le compteur
    current.count++
    rateLimitStore.set(key, current)

    // Ajouter les headers de rate limiting
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (config.maxRequests - current.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(current.resetTime).toISOString())

    return response
  }
}

// Configurations prédéfinies
export const rateLimiters = {
  // Limite stricte pour l&apos;authentification
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 tentatives par 15 minutes
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
  }),

  // Limite modérée pour les APIs générales
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requêtes par minute
    message: 'Trop de requêtes. Veuillez ralentir.'
  }),

  // Limite pour la création de tickets
  tickets: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 tickets par minute
    message: 'Trop de tickets créés. Veuillez ralentir.'
  }),

  // Limite pour les paiements
  payments: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 paiements par minute
    message: 'Trop de tentatives de paiement. Veuillez réessayer plus tard.'
  })
} 