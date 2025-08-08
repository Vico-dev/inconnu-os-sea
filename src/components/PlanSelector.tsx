"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, TrendingUp, Zap, Crown, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

const plans = [
  { 
    id: 'SMALL_BUDGET', 
    name: 'Petit Chasseur', 
    price: 200, 
    description: 'Pour les entreprises avec un budget média inférieur à 1000€/mois', 
    features: [
      'Audit mensuel de vos campagnes',
      'Optimisations techniques',
      'Recommandations stratégiques',
      'Support par email',
      'Reporting mensuel',
      "Accès à l'espace client"
    ], 
    icon: Zap, 
    popular: false, 
    mediaBudget: '< 1000€/mois' 
  },
  { 
    id: 'MEDIUM_BUDGET', 
    name: 'Chasseur', 
    price: 400, 
    description: 'Pour les entreprises avec un budget média de 1000€ à 5000€/mois', 
    features: [
      'Tout du forfait Petit Chasseur',
      'Call hebdomadaire de 30 min',
      'Optimisations en temps réel',
      'Reporting détaillé',
      'Support prioritaire',
      'Formation équipe',
      'Tests A/B'
    ], 
    icon: TrendingUp, 
    popular: true, 
    mediaBudget: '1000€ - 5000€/mois' 
  },
  { 
    id: 'LARGE_BUDGET', 
    name: 'Grand Chasseur', 
    price: 600, 
    description: 'Pour les entreprises avec un budget média de 5000€ à 10000€/mois', 
    features: [
      'Tout du forfait Chasseur',
      'Dédié account manager',
      'Support 24/7',
      'Stratégie personnalisée',
      'Analytics avancées',
      'Formation complète',
      'Accompagnement prioritaire'
    ], 
    icon: Crown, 
    popular: false, 
    mediaBudget: '5000€ - 10000€/mois' 
  }
]

interface PlanSelectorProps {
  clientAccountId?: string
  onPlanSelected?: (planId: string) => void
  preSelectedPlan?: string | null
}

export default function PlanSelector({ clientAccountId, onPlanSelected, preSelectedPlan }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const router = useRouter()

  // Pré-sélectionner le plan si fourni
  useEffect(() => {
    if (preSelectedPlan) {
      setSelectedPlan(preSelectedPlan)
    }
  }, [preSelectedPlan])

  const handlePlanSelect = (planId: string) => setSelectedPlan(planId)

  const handleSubscribe = async () => {
    if (!selectedPlan) return toast.error('Veuillez sélectionner un forfait')
    if (!clientAccountId) return toast.error('Compte client non trouvé')

    setIsSubscribing(true)
    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, clientAccountId })
      })
      if (!response.ok) throw new Error((await response.json()).error || 'Erreur Stripe')
      const data = await response.json()
      if (data.url) { window.location.href = data.url; return }
      toast.error('URL de paiement introuvable')
    } catch (e) {
      console.error(e)
      toast.error('Erreur lors de la création du paiement')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isSelected = selectedPlan === plan.id
          return (
            <Card key={plan.id} className={`relative transition-all duration-300 cursor-pointer ${isSelected ? 'border-2 border-blue-500 shadow-xl scale-105' : plan.popular ? 'border-2 border-blue-300 shadow-lg' : 'border border-gray-200 hover:border-blue-300'}`} onClick={() => handlePlanSelect(plan.id)}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-900 to-blue-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1" /> Recommandé
                </Badge>
              )}
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-900 to-blue-500 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <p className="text-gray-600 text-sm">{plan.description}</p>
                <div className="mt-4"><span className="text-3xl font-bold text-gray-900">{plan.price}€</span><span className="text-gray-600">/mois HT</span></div>
                <div className="text-sm text-gray-500 mt-2">Budget média : {plan.mediaBudget}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm"><Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" /><span className="text-gray-700">{feature}</span></li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Button className={`w-full ${isSelected ? 'bg-gradient-to-r from-blue-900 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white' : plan.popular ? 'bg-gradient-to-r from-blue-900 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white' : 'bg-white border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'}`} disabled={isSubscribing} onClick={handleSubscribe}>
                    {isSubscribing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirection vers le paiement...</>) : ('Souscrire')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 