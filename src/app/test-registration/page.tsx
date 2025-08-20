'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestRegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: 'Test',
    lastName: 'User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    company: 'Test Company'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'client'
        }),
      })

      const data = await response.json()
      setResult({
        status: response.status,
        success: response.ok,
        data
      })

      if (response.ok) {
        // Test de vérification en base
        setTimeout(async () => {
          try {
            const userResponse = await fetch(`/api/debug/user?email=${formData.email}`)
            const userData = await userResponse.json()
            setResult(prev => ({
              ...prev,
              userInDb: userData
            }))
          } catch (error) {
            console.error('Erreur vérification base:', error)
          }
        }, 1000)
      }

    } catch (error) {
      setResult({
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🧪 Test d'inscription</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  'Tester l\'inscription'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Test réussi
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    Test échoué
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant={result.success ? "default" : "destructive"}>
                  <AlertDescription>
                    Status: {result.status} - {result.success ? 'Succès' : 'Échec'}
                  </AlertDescription>
                </Alert>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Réponse API:</h4>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(result.data || result.error, null, 2)}
                  </pre>
                </div>

                {result.userInDb && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Utilisateur en base:</h4>
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(result.userInDb, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 