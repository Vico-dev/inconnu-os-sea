import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Évite toute tentative de parsing du body (FormData) sur la 404 en prod
// en forçant le rendu statique et le runtime Node.js
export const dynamic = 'force-static'
export const runtime = 'nodejs'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">
            Page non trouvée
          </h2>
          <p className="text-gray-600 mt-2">
            Désolé, la page que vous recherchez n'existe pas.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild>
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
          
          <div className="text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Se connecter
            </Link>
            {' • '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 