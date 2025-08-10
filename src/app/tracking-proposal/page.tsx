"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight, Calendar, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'

export default function TrackingProposalPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null)

  const plans = [
    {
      id: 'monthly',
      name: 'Tracking Mensuel',
      price: '490€',
      period: 'HT/mois',
      description: 'Sans engagement, annulable à tout moment',
      features: [
        'Configuration complète du tracking',
        'Mise en place Google Analytics 4',
        'Configuration des conversions',
        'Formation à l\'utilisation',
        'Support par email',
        'Rapports mensuels'
      ],
      popular: false,
      cta: 'Choisir le tracking mensuel'
    },
    {
      id: 'yearly',
      name: 'Tracking Annuel',
      price: '250€',
      period: 'HT/mois',
      description: 'Avec engagement d\'un an (économisez 2 880€)',
      features: [
        'Configuration complète du tracking',
        'Mise en place Google Analytics 4',
        'Configuration des conversions',
        'Formation à l\'utilisation',
        'Support prioritaire',
        'Rapports mensuels',
        'Optimisations trimestrielles',
        'Audit de tracking inclus'
      ],
      popular: true,
      cta: 'Choisir le tracking annuel'
    }
  ]

  const handlePlanSelect = (planId: 'monthly' | 'yearly') => {
    setSelectedPlan(planId)
  }

  const handleSubscribe = () => {
    if (selectedPlan) {
      // Rediriger vers le checkout avec le plan sélectionné
      window.location.href = `/client/checkout?plan=TRACKING_${selectedPlan.toUpperCase()}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Optimisez vos campagnes avec le tracking
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mesurez précisément vos conversions et optimisez vos campagnes Google Ads 
            avec notre service de tracking professionnel.
          </p>
        </div>

        {/* Avantages du tracking */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mesurez vos conversions</h3>
              <p className="text-gray-600">
                Suivez précisément chaque conversion et optimisez vos campagnes en conséquence.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">ROI optimisé</h3>
              <p className="text-gray-600">
                Identifiez vos meilleures sources de trafic et maximisez votre retour sur investissement.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Mise en place rapide</h3>
              <p className="text-gray-600">
                Configuration complète en 48h avec formation et support inclus.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedPlan === plan.id 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handlePlanSelect(plan.id as 'monthly' | 'yearly')}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                  Recommandé
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </div>
                  <div className="text-gray-600">{plan.period}</div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    selectedPlan === plan.id 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === plan.id ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sélectionné
                    </>
                  ) : (
                    <>
                      Sélectionner
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        {selectedPlan && (
          <div className="text-center mt-8">
            <Button 
              onClick={handleSubscribe}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Souscrire au tracking {selectedPlan === 'monthly' ? 'mensuel' : 'annuel'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Besoin d'aide pour choisir ? Contactez-nous pour un audit gratuit.
          </p>
          <Link 
            href="/contact" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Demander un audit gratuit →
          </Link>
        </div>
      </div>
    </div>
  )
} 