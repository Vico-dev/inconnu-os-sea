'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Token de vérification manquant')
      return
    }

    // Vérifier le token
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStatus('success')
          setMessage('Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.')
          toast.success('Email vérifié avec succès !')
        } else {
          setStatus('error')
          setMessage(data.error || 'Erreur lors de la vérification')
          toast.error(data.error || 'Erreur lors de la vérification')
        }
      })
      .catch(error => {
        console.error('Erreur vérification:', error)
        setStatus('error')
        setMessage('Erreur lors de la vérification de votre email')
        toast.error('Erreur lors de la vérification')
      })
  }, [searchParams])

  const handleResendEmail = async () => {
    // Ici on pourrait ajouter une logique pour renvoyer l'email
    toast.info('Fonctionnalité à implémenter')
  }

  const handleGoToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Vérification de votre email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {status === 'loading' && 'Vérification en cours...'}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            {status === 'loading' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
                <CardTitle className="text-lg">Vérification en cours</CardTitle>
                <CardDescription>
                  Nous vérifions votre email...
                </CardDescription>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg text-green-600">Email vérifié !</CardTitle>
                <CardDescription>
                  Votre compte est maintenant actif
                </CardDescription>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg text-red-600">Erreur de vérification</CardTitle>
                <CardDescription>
                  Impossible de vérifier votre email
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              {message}
            </p>

            {status === 'success' && (
              <Button 
                onClick={handleGoToLogin}
                className="w-full"
              >
                Se connecter
              </Button>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Renvoyer l'email de vérification
                </Button>
                
                <Button 
                  onClick={handleGoToLogin}
                  className="w-full"
                >
                  Retour à la connexion
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Si vous rencontrez des problèmes, contactez notre support
          </p>
        </div>
      </div>
    </div>
  )
} 