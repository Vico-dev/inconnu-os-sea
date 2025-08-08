"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import PlanSelector from '@/components/PlanSelector'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function SubscribePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clientAccountId, setClientAccountId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [preSelectedPlan, setPreSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Récupérer le plan pré-sélectionné depuis l'URL
    const planFromUrl = searchParams.get('plan')
    if (planFromUrl) {
      setPreSelectedPlan(planFromUrl)
    }

    const fetchClientAccount = async () => {
      try {
        const response = await fetch('/api/client/account')
        if (response.ok) {
          const data = await response.json()
          setClientAccountId(data.clientAccount.id)
        } else {
          console.error('Erreur lors de la récupération du compte client')
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientAccount()
  }, [session, status, router, searchParams])

  const handlePlanSelected = (planId: string) => {
    router.push('/client')
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isFromOnboarding = !!preSelectedPlan

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/client">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'espace client
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-500 bg-clip-text text-transparent mb-4">
              {isFromOnboarding ? 'Finalisez votre inscription' : 'Choisissez votre forfait'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isFromOnboarding 
                ? 'Complétez votre inscription en souscrivant à votre forfait sélectionné.'
                : 'Sélectionnez le forfait qui correspond à votre budget média et vos objectifs.'
              }
            </p>
          </div>
        </div>

        {/* Informations paiement */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <ShieldCheck className="w-6 h-6 text-blue-700 mr-3" />
              <p className="text-blue-700">
                Paiement sécurisé par Stripe. Sans engagement. Facturation mensuelle.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sélecteur de plans */}
        <PlanSelector 
          clientAccountId={clientAccountId || undefined}
          onPlanSelected={handlePlanSelected}
          preSelectedPlan={preSelectedPlan}
        />
      </div>
    </div>
  )
} 