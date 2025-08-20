'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erreur:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-300 mb-4">⚠️</h1>
          <h2 className="text-2xl font-semibold text-gray-900">
            Une erreur s'est produite
          </h2>
          <p className="text-gray-600 mt-2">
            Désolé, quelque chose s'est mal passé.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            <Button onClick={reset} variant="outline">
              Réessayer
            </Button>
            <Button asChild>
              <Link href="/">
                Retour à l'accueil
              </Link>
            </Button>
          </div>
          
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