"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [clientAccountId, setClientAccountId] = useState<string | null>(null)

  const plan = searchParams.get('plan')

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
          // Rediriger directement vers le checkout Stripe
          await redirectToStripeCheckout(data.clientAccount.id)
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

  const redirectToStripeCheckout = async (accountId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, clientAccountId: accountId })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Erreur Stripe')
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      toast.error('URL de paiement introuvable')
      router.push('/client/subscribe')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création du paiement')
      router.push('/client/subscribe')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold mb-2">Préparation du paiement</h2>
            <p className="text-gray-600">Redirection vers le checkout sécurisé...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Redirection en cours</h2>
          <p className="text-gray-600 mb-4">Vous allez être redirigé vers le paiement sécurisé...</p>
          <Button disabled className="w-full">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Préparation du paiement
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 