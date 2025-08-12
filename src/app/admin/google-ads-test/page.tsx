"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Loader2, CheckCircle, XCircle, RefreshCw, Database, Shield, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface GoogleAdsTestResult {
  test: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: any
}

export default function GoogleAdsTestPage() {
  const { data: session, status } = useSession()
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<GoogleAdsTestResult[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      checkConnectionStatus()
    }
  }, [session, status])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/google-ads/status')
      if (response.ok) {
        const data = await response.json()
        setConnectionStatus(data.connected ? 'connected' : 'disconnected')
      }
    } catch (error) {
      setConnectionStatus('disconnected')
    }
  }

  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    const tests = [
      {
        name: 'Configuration des variables d\'environnement',
        endpoint: '/api/google-ads/test/config'
      },
      {
        name: 'Authentification OAuth',
        endpoint: '/api/google-ads/test/auth'
      },
      {
        name: 'Connexion à l\'API Google Ads',
        endpoint: '/api/google-ads/test/connection'
      },
      {
        name: 'Récupération des comptes MCC',
        endpoint: '/api/google-ads/test/accounts'
      },
      {
        name: 'Test de requête de données',
        endpoint: '/api/google-ads/test/query'
      }
    ]

    for (const test of tests) {
      setResults(prev => [...prev, {
        test: test.name,
        status: 'pending',
        message: 'Test en cours...'
      }])

      try {
        const response = await fetch(test.endpoint)
        const data = await response.json()

        setResults(prev => prev.map(r => 
          r.test === test.name 
            ? {
                test: test.name,
                status: response.ok ? 'success' : 'error',
                message: data.message || (response.ok ? 'Test réussi' : 'Test échoué'),
                details: data.details
              }
            : r
        ))

        if (!response.ok) {
          toast.error(`Échec du test: ${test.name}`)
        }
      } catch (error) {
        setResults(prev => prev.map(r => 
          r.test === test.name 
            ? {
                test: test.name,
                status: 'error',
                message: 'Erreur de connexion',
                details: error
              }
            : r
        ))
        toast.error(`Erreur lors du test: ${test.name}`)
      }
    }

    setIsRunning(false)
    checkConnectionStatus()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <RefreshCw className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Succès</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>
    }
  }

  if (status === 'loading') {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center">
                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
                <p className="text-gray-600">Cette page est réservée aux administrateurs.</p>
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout>
                <div className="p-6 space-y-6">
          <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test d'intégration Google Ads API
          </h1>
          <p className="text-gray-600">
            Vérifiez que l'intégration Google Ads API fonctionne correctement
          </p>
        </div>

        {/* Statut de connexion */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Statut de connexion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className={
                connectionStatus === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : connectionStatus === 'disconnected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }>
                {connectionStatus === 'connected' ? 'Connecté' : 
                 connectionStatus === 'disconnected' ? 'Déconnecté' : 'Inconnu'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkConnectionStatus}
                disabled={isRunning}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bouton de test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tests automatisés</CardTitle>
            <CardDescription>
              Lancez une série de tests pour vérifier l'intégration Google Ads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Tests en cours...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Lancer les tests
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Résultats des tests */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats des tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{result.test}</h3>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-gray-600">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-sm text-blue-600 cursor-pointer">
                            Voir les détails
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations utiles */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations utiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Variables d'environnement</h4>
                  <p className="text-sm text-gray-600">
                    Vérifiez que toutes les variables Google Ads sont configurées sur Railway
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Developer Token</h4>
                  <p className="text-sm text-gray-600">
                    Assurez-vous que le Developer Token est approuvé par Google
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 