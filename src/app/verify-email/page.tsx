"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success === 'true') {
      setStatus('success')
      setMessage('Votre email a été vérifié avec succès !')
      const emailParam = searchParams.get('email')
      if (emailParam) setEmail(decodeURIComponent(emailParam))
    } else if (error) {
      if (error === 'expired_token') {
        setStatus('expired')
        setMessage('Le lien de validation a expiré')
      } else {
        setStatus('error')
        setMessage('Lien de validation invalide')
      }
    } else if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('Lien de validation invalide')
    }
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`)
      
      if (response.ok) {
        setStatus('success')
        setMessage('Votre email a été vérifié avec succès !')
      } else {
        const data = await response.json()
        if (data.error?.includes('expiré')) {
          setStatus('expired')
          setMessage('Le lien de validation a expiré')
        } else {
          setStatus('error')
          setMessage(data.error || 'Erreur lors de la validation')
        }
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erreur de connexion')
    }
  }

  const resendVerification = async () => {
    if (!email) {
      setMessage('Impossible de renvoyer l\'email sans adresse email')
      return
    }

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Email de vérification renvoyé avec succès ! Vérifiez votre boîte de réception.')
      } else {
        setMessage(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      setMessage('Erreur de connexion')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />
      case 'error':
      case 'expired':
        return <XCircle className="w-16 h-16 text-red-600" />
      default:
        return <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
      case 'expired':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-3xl font-bold">
            {status === 'loading' && 'Validation en cours...'}
            {status === 'success' && 'Email vérifié !'}
            {status === 'error' && 'Erreur de validation'}
            {status === 'expired' && 'Lien expiré'}
          </CardTitle>
          <CardDescription className="text-lg">
            {status === 'loading' && 'Vérification de votre email...'}
            {status === 'success' && 'Votre compte est maintenant actif'}
            {status === 'error' && 'Le lien de validation est invalide'}
            {status === 'expired' && 'Le lien de validation a expiré'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {message && (
            <Alert className={getStatusColor()}>
              <AlertDescription className={
                status === 'success' ? 'text-green-800' : 
                status === 'error' || status === 'expired' ? 'text-red-800' : 
                'text-blue-800'
              }>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 text-center">
                  🎉 Félicitations ! Votre compte a été validé avec succès. 
                  Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/login">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Se connecter
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/client">
                    Accéder au dashboard
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 text-center">
                  ⏰ Le lien de validation a expiré. Les liens de validation sont valides pendant 24 heures.
                </p>
              </div>
              <div className="space-y-3">
                <Button onClick={resendVerification} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Renvoyer l'email de vérification
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">
                    Retour à la connexion
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 text-center">
                  ❌ Le lien de validation est invalide. Veuillez vérifier votre email ou contacter le support.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">
                    Retour à la connexion
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/register">
                    Créer un nouveau compte
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  🔄 Veuillez patienter pendant la vérification de votre email...
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Besoin d'aide ? Contactez-nous à{' '}
              <a href="mailto:support@agence-inconnu.fr" className="text-blue-600 hover:underline">
                support@agence-inconnu.fr
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 