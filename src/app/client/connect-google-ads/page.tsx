"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, AlertCircle, ExternalLink, Shield, Zap } from "lucide-react"

function ConnectGoogleAdsContent() {
  const { session, status } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    // Vérifier les paramètres d'URL pour les messages de succès/erreur
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success === "google_ads_connected") {
      setConnectionStatus("success")
    } else if (error) {
      setConnectionStatus("error")
      setErrorMessage(getErrorMessage(error))
    }
  }, [session, status, router, searchParams])

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "google_auth_failed":
        return "L'authentification Google a échoué. Veuillez réessayer."
      case "missing_params":
        return "Paramètres manquants. Veuillez réessayer."
      case "no_access_token":
        return "Impossible d'obtenir le token d'accès. Veuillez réessayer."
      case "callback_failed":
        return "Erreur lors de la connexion. Veuillez réessayer."
      default:
        return "Une erreur est survenue lors de la connexion."
    }
  }

  const handleConnectGoogleAds = async () => {
    setIsConnecting(true)
    setConnectionStatus("connecting")

    try {
      const response = await fetch(`/api/google-ads/auth?userId=${session?.user?.id}`)
      
      if (response.ok) {
        const data = await response.json()
        // Rediriger vers Google OAuth
        window.location.href = data.authUrl
      } else {
        setConnectionStatus("error")
        setErrorMessage("Erreur lors de la génération de l'URL d'autorisation")
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage("Erreur de connexion")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleGoBack = () => {
    router.push("/client")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Inconnu OS</span>
          </div>
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          {connectionStatus === "success" && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Connexion réussie !
                    </h3>
                    <p className="text-green-700">
                      Votre compte Google Ads a été connecté avec succès.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {connectionStatus === "error" && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">
                      Erreur de connexion
                    </h3>
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="w-6 h-6" />
                <span>Connecter Google Ads</span>
              </CardTitle>
              <CardDescription>
                Connectez votre compte Google Ads pour accéder à vos données de campagne
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Benefits */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-900">Sécurisé</h4>
                  <p className="text-sm text-blue-700">
                    Connexion OAuth 2.0 sécurisée
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-900">Rapide</h4>
                  <p className="text-sm text-green-700">
                    Synchronisation automatique
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-900">Simple</h4>
                  <p className="text-sm text-purple-700">
                    Configuration en 2 clics
                  </p>
                </div>
              </div>

              {/* Connection Status */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Statut de connexion</h4>
                    <p className="text-sm text-gray-600">
                      {session?.user?.clientAccount?.googleAdsConnected 
                        ? "Compte connecté" 
                        : "Aucun compte connecté"}
                    </p>
                  </div>
                  <Badge variant={session?.user?.clientAccount?.googleAdsConnected ? "default" : "secondary"}>
                    {session?.user?.clientAccount?.googleAdsConnected ? "Connecté" : "Non connecté"}
                  </Badge>
                </div>
              </div>

              {/* Connect Button */}
              <div className="text-center">
                <Button
                  onClick={handleConnectGoogleAds}
                  disabled={isConnecting}
                  size="lg"
                  className="px-8"
                >
                  {isConnecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Connexion en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="w-5 h-5" />
                      <span>Connecter Google Ads</span>
                    </div>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Vous serez redirigé vers Google pour autoriser l'accès
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ConnectGoogleAdsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ConnectGoogleAdsContent />
    </Suspense>
  )
} 