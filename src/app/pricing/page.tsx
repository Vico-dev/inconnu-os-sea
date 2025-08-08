"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, TrendingUp, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

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

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-blue-500 bg-clip-text text-transparent mb-6">
            Nos Forfaits
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choisissez le forfait qui correspond à votre budget média et vos objectifs.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-2 border-blue-500 shadow-xl'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-900 to-blue-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Recommandé
                  </Badge>
                )}

                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-900 to-blue-500 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price}€
                    </span>
                    <span className="text-gray-600">/mois HT</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Budget média : {plan.mediaBudget}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6">
                    <Link href="/client/subscribe">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-900 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white'
                            : 'bg-white border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white'
                        }`}
                      >
                        Souscrire
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Questions Fréquentes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Y a-t-il un engagement ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Aucun engagement. Paiement mensuel sécurisé par Stripe.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Quand verrai-je les premiers résultats ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Les premiers résultats sont généralement visibles dès 2-3 semaines.
                  Nous optimisons en continu pour des améliorations constantes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Puis-je changer de forfait ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Oui, vous pouvez passer à un forfait supérieur à tout moment.
                  Pour un forfait inférieur, nous vous recommandons de nous contacter.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-900 to-blue-500 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à transformer vos campagnes ?
            </h3>
            <p className="text-blue-100 mb-6">
              Paiement sécurisé, sans engagement. Souscrivez en ligne en 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/client/subscribe">
                <Button size="lg" variant="secondary" className="text-lg">
                  Souscrire maintenant
                </Button>
              </Link>
              <Link href="/#contact">
                <Button size="lg" variant="outline" className="text-lg bg-transparent border-white text-white hover:bg-white hover:text-blue-900">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 