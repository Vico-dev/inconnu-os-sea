"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [clientAccountId, setClientAccountId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [acceptCgv, setAcceptCgv] = useState(false)
  const [creating, setCreating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [publishableKey, setPublishableKey] = useState<string | null>(null)
  const [keyLoading, setKeyLoading] = useState(true)

  const plan = searchParams?.get('plan')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (!plan) {
      router.push('/client/subscribe')
      return
    }

    const fetchClientAccount = async () => {
      try {
        const response = await fetch('/api/client/account')
        if (response.ok) {
          const data = await response.json()
          setClientAccountId(data.clientAccount.id)
        } else {
          console.error('Erreur lors de la récupération du compte client')
          router.push('/client/subscribe')
        }
      } catch (error) {
        console.error('Erreur:', error)
        router.push('/client/subscribe')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientAccount()
  }, [session, status, router, plan])

  // Charger la clé publique via l'API (plus fiable que build-time)
  useEffect(() => {
    const loadKey = async () => {
      try {
        setKeyLoading(true)
        const res = await fetch('/api/stripe/public-key', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (!res.ok) throw new Error('Failed to fetch public key')
        const data = await res.json()
        if (data.publishableKey) {
          setPublishableKey(data.publishableKey)
          console.log('✅ Clé Stripe chargée via API')
        } else {
          throw new Error('No publishable key in response')
        }
      } catch (e) {
        console.error('❌ Erreur chargement clé Stripe:', e)
        setErrorMessage('Impossible de charger la configuration de paiement')
      } finally {
        setKeyLoading(false)
      }
    }
    void loadKey()
  }, [])

  // Déclenchement automatique une fois les CGV acceptées
  useEffect(() => {
    if (!clientAccountId || !plan) return
    if (!acceptCgv) return
    if (clientSecret || creating) return
    void handleStartPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientAccountId, plan, acceptCgv])

  const createEmbeddedCheckout = async (accountId: string) => {
    try {
      setStatusMessage('Création de la session de paiement…')
      setErrorMessage(null)
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan, 
          clientAccountId: accountId,
          cgv: {
            accepted: true,
            version: 'v1',
            acceptedAt: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `Erreur Stripe (${response.status})`)
      }

      const data = await response.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setStatusMessage('Session prête, affichage du module Stripe…')
        return
      }
      if (data.url) {
        setStatusMessage('Redirection vers Stripe…')
        window.location.href = data.url
        return
      }
      throw new Error('Données de paiement introuvables')
    } catch (error: any) {
      console.error('Erreur création paiement:', error)
      setErrorMessage(error?.message || 'Erreur lors de la création du paiement')
      toast.error(error?.message || 'Erreur lors de la création du paiement')
    } finally {
      setStatusMessage(null)
    }
  }

  const handleStartPayment = async () => {
    if (!clientAccountId) return
    setCreating(true)
    await createEmbeddedCheckout(clientAccountId)
    setCreating(false)
  }

  if (status === 'loading' || isLoading || keyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Préparation du paiement</h2>
            <p className="text-gray-600">Chargement de la configuration sécurisée...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stripePromise = publishableKey ? loadStripe(publishableKey) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          <h2 className="text-2xl font-semibold mb-3 text-center">Finaliser votre paiement</h2>
          <p className="text-gray-600 text-center mb-6">Vérifiez le plan choisi puis acceptez les CGV pour accéder au paiement sécurisé Stripe.</p>

          <div className="rounded-lg border border-gray-200 p-4 mb-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Plan</div>
                <div className="font-semibold text-gray-900">{plan}</div>
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 mb-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={acceptCgv}
              onChange={(e) => setAcceptCgv(e.target.checked)}
            />
            <span className="text-sm text-gray-700">
              J'ai lu et j'accepte les <a href="/cgv" target="_blank" className="text-blue-700 underline">Conditions Générales de Vente</a>.
            </span>
          </label>

          {!acceptCgv && (
            <div className="text-xs text-gray-500 mb-4">Cochez la case pour accéder au paiement.</div>
          )}

          {acceptCgv && !clientSecret && (
            <div className="flex items-center gap-3 mb-2">
              <Button onClick={handleStartPayment} disabled={creating} className="ml-auto">
                {creating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initialisation…</>) : 'Accéder au paiement sécurisé'}
              </Button>
            </div>
          )}

          {acceptCgv && !clientSecret && (
            <div className="w-full text-center text-sm text-gray-600 mb-2">{statusMessage || 'Le module Stripe apparaîtra ici dès qu\'il est prêt.'}</div>
          )}

          {errorMessage && (
            <div className="text-sm text-red-600 mb-3">{errorMessage}</div>
          )}

          {/* Panneau de diagnostic */}
          <div className="text-xs text-gray-500 border border-dashed rounded p-3 mb-4">
            <div>Diag:</div>
            <div>plan: <span className="font-mono">{String(plan)}</span></div>
            <div>clientAccountId: <span className="font-mono">{String(clientAccountId)}</span></div>
            <div>publishableKey présent: <span className="font-mono">{publishableKey ? 'oui' : 'non'}</span></div>
            <div>clientSecret reçu: <span className="font-mono">{clientSecret ? 'oui' : 'non'}</span></div>
          </div>

          {clientSecret && stripePromise && (
            <div className="mt-6">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}

          {clientSecret && !stripePromise && (
            <div className="text-sm text-red-600">Configuration de paiement manquante. Veuillez rafraîchir la page.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 