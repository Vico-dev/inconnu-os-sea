import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname } = request.nextUrl

  // Récupérer l'IP du client
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'

  // Log de la requête
  logger.info(`Request started: ${request.method} ${pathname}`, {
    method: request.method,
    path: pathname,
    userAgent: request.headers.get('user-agent'),
    ip
  })

  // Protection des routes sensibles
  const protectedRoutes = ['/admin', '/am', '/client']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Vérifier l'authentification
    const token = request.cookies.get('next-auth.session-token')?.value ||
                  request.cookies.get('__Secure-next-auth.session-token')?.value

    if (!token) {
      logger.warn(`Unauthorized access attempt: ${pathname}`, {
        path: pathname,
        ip
      })
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const response = NextResponse.next()

  // Log de la réponse
  const duration = Date.now() - startTime
  logger.apiCall(request.method, pathname, response.status, duration)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 