"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EmailVerifiedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
      const token = searchParams?.get('token')
  const error = searchParams?.get('error')

    if (error) {
      setStatus('error')
      switch (error) {
        case 'token_missing':
          setMessage('Lien de validation invalide. Veuillez vérifier votre email.')
          break
        case 'invalid_token':
          setMessage('Le lien de validation est invalide ou a expiré.')
          break
        case 'token_expired':
          setMessage('Le lien de validation a expiré. Veuillez demander un nouveau lien.')
          break
        default:
          setMessage('Une erreur s\'est produite lors de la validation.')
      }
    } else if (token) {
      // Simuler la validation (en réalité, c'est géré par l'API)
      setStatus('success')
      setMessage('Votre email a été validé avec succès !')
      
      // Redirection automatique après 5 secondes
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/login?message=email_verified')
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else {
      setStatus('error')
      setMessage('Lien de validation invalide.')
    }
  }, [searchParams, router])

  const handleGoToLogin = () => {
    router.push('/login?message=email_verified')
  }

  const handleResendEmail = () => {
    router.push('/register/confirmation?email=' + searchParams?.get('email'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            {status === 'loading' && (
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
            
            <CardTitle className={`text-2xl font-bold ${
              status === 'success' ? 'text-green-900' : 
              status === 'error' ? 'text-red-900' : 'text-gray-900'
            }`}>
              {status === 'loading' && 'Validation en cours...'}
              {status === 'success' && 'Email validé ! 🎉'}
              {status === 'error' && 'Erreur de validation'}
            </CardTitle>
            
            <CardDescription className="text-lg">
              {message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {status === 'success' && (
              <>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 text-sm">
                    Votre compte est maintenant actif. Vous pouvez vous connecter à votre espace client.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleGoToLogin} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Se connecter maintenant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                  </p>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 text-sm">
                    {message}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Demander un nouveau lien
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={handleGoToLogin} 
                    className="w-full"
                  >
                    Aller à la page de connexion
                  </Button>
                </div>
              </>
            )}

            {/* Retour à l'accueil */}
            <div className="text-center pt-4 border-t">
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 