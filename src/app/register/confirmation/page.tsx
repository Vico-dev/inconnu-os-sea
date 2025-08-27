"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RegisterConfirmationPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [isDevelopment, setIsDevelopment] = useState(false)

  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === 'development')
  }, [])

  const handleAutoVerify = async () => {
    try {
      // En mode développement, on peut valider automatiquement
      const response = await fetch('/api/auth/verify-email?token=dev-auto-verify', {
        method: 'GET'
      })
      
      if (response.ok) {
        window.location.href = '/login?message=email_verified'
      }
    } catch (error) {
      console.error('Erreur validation automatique:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Inscription réussie !
          </CardTitle>
          <CardDescription className="text-gray-600">
            Votre compte a été créé avec succès
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {email && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Un email de confirmation a été envoyé à :
              </p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          )}

          {isDevelopment ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Mode Développement</span>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                En mode développement, vous pouvez valider votre email automatiquement.
              </p>
              <Button 
                onClick={handleAutoVerify}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Valider automatiquement
              </Button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Vérifiez votre email</span>
              </div>
              <p className="text-sm text-blue-700">
                Cliquez sur le lien dans l'email pour valider votre compte et commencer à utiliser la plateforme.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full">
                Aller à la connexion
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Vous n'avez pas reçu l'email ?</p>
            <p>Vérifiez vos spams ou contactez le support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 