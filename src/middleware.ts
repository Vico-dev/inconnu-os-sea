import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/login',
    '/register',
    '/api/auth',
    '/api/health',
    '/api/test-auth',
    '/api/google-ads/auth',
    '/api/google-ads/callback'
  ]

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protection des routes sensibles
  const protectedRoutes = ['/admin', '/am', '/client']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Vérifier l'authentification avec les nouveaux noms de cookies
    const sessionToken = request.cookies.get('__Secure-next-auth.session-token')?.value ||
                        request.cookies.get('next-auth.session-token')?.value

    // Si pas de token, on ne redirige que les pages HTML, pas les assets/API
    if (!sessionToken && request.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
  
  /* CODE ORIGINAL COMMENTÉ POUR DIAGNOSTIC
  const { pathname } = request.nextUrl

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/login',
    '/register',
    '/api/auth',
    '/api/health',
    '/api/test-auth',
    '/api/google-ads/auth',
    '/api/google-ads/callback'
  ]

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protection des routes sensibles
  const protectedRoutes = ['/admin', '/am', '/client']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Vérifier l'authentification
    // NextAuth v4 avec strategy JWT n'émet pas toujours un cookie de session côté serveur
    // On laisse passer et on s'appuie sur la protection côté composant pour éviter boucles
    const token = request.cookies.get('next-auth.session-token')?.value ||
                  request.cookies.get('__Secure-next-auth.session-token')?.value

    // Si pas de token, on ne redirige que les pages HTML, pas les assets/API
    if (!token && request.headers.get('accept')?.includes('text/html')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
  */
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