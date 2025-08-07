import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Stockage temporaire des tokens CSRF (en production, utilisez Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>()

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + (60 * 60 * 1000) // 1 heure

  csrfTokens.set(sessionId, { token, expires })

  // Nettoyer les tokens expirés
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < Date.now()) {
      csrfTokens.delete(key)
    }
  }

  return token
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId)
  
  if (!stored || stored.expires < Date.now()) {
    csrfTokens.delete(sessionId)
    return false
  }

  if (stored.token !== token) {
    return false
  }

  // Token utilisé, le supprimer
  csrfTokens.delete(sessionId)
  return true
}

export function createCSRFMiddleware() {
  return function csrfProtection(request: NextRequest) {
    // Seulement pour les méthodes POST, PUT, DELETE
    if (!['POST', 'PUT', 'DELETE'].includes(request.method)) {
      return null
    }

    // Routes sensibles qui nécessitent une protection CSRF
    const sensitiveRoutes = [
      '/api/auth/register',
      '/api/tickets/create',
      '/api/subscription/create',
      '/api/admin/users'
    ]

    const isSensitiveRoute = sensitiveRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    if (!isSensitiveRoute) {
      return null
    }

    // Vérifier le token CSRF
    const csrfToken = request.headers.get('x-csrf-token')
    const sessionId = request.headers.get('x-session-id')

    if (!csrfToken || !sessionId) {
      return NextResponse.json(
        { error: 'Token CSRF manquant' },
        { status: 403 }
      )
    }

    if (!validateCSRFToken(sessionId, csrfToken)) {
      return NextResponse.json(
        { error: 'Token CSRF invalide' },
        { status: 403 }
      )
    }

    return null // Token valide
  }
} 