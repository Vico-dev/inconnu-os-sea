"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Mail, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function RegistrationConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    const emailParam = searchParams?.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setResendSuccess(true)
        toast.success('Email de validation renvoyé avec succès !')
      } else {
        toast.error('Erreur lors de l\'envoi de l\'email')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setIsResending(false)
    }
  }

  const handleGoToLogin = () => {
    router.push('/login?message=email_sent')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Compte créé avec succès ! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              Votre compte a été créé. Il ne vous reste plus qu'une étape pour commencer.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Validez votre email
                  </h3>
                  <p className="text-blue-800 text-sm">
                    Nous avons envoyé un email de validation à :<br />
                    <span className="font-medium">{email}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Étapes */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Prochaines étapes :</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span className="text-sm text-gray-700">Vérifiez votre boîte de réception</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className="text-sm text-gray-700">Cliquez sur le lien de validation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <span className="text-sm text-gray-700">Connectez-vous à votre espace client</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleGoToLogin} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Aller à la page de connexion
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center">
                <span className="text-sm text-gray-600">Pas reçu l'email ?</span>
                <Button 
                  variant="link" 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Renvoyer l\'email de validation'
                  )}
                </Button>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Important</h4>
                  <p className="text-sm text-gray-600">
                    Vérifiez également votre dossier spam si vous ne trouvez pas l'email. 
                    Le lien de validation expire dans 24 heures.
                  </p>
                </div>
              </div>
            </div>

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