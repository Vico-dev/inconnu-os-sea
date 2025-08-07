"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, ArrowLeft } from "lucide-react"

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 99,
    period: "mois",
    features: [
      "Gestion de 1 compte Google Ads",
      "Reporting hebdomadaire",
      "Support par email",
      "Optimisations mensuelles"
    ],
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: "pro",
    name: "Pro",
    price: 199,
    period: "mois",
    features: [
      "Gestion de 3 comptes Google Ads",
      "Reporting quotidien",
      "Support prioritaire",
      "Optimisations hebdomadaires",
      "Formation personnalisée"
    ],
    popular: true,
    icon: <Star className="w-6 h-6" />
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 399,
    period: "mois",
    features: [
      "Gestion illimitée de comptes",
      "Reporting en temps réel",
      "Support dédié 24/7",
      "Optimisations quotidiennes",
      "Formation complète",
      "Stratégie personnalisée"
    ],
    icon: <Crown className="w-6 h-6" />
  }
]

export default function ChangePlanPage() {
  const { session, status } = useAuth()
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    // Récupérer le plan actuel
    fetchCurrentPlan()
  }, [session, status, router])

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch(`/api/subscription/status?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.subscription?.plan?.toLowerCase() || null)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du plan actuel:", error)
    }
  }

  const handlePlanChange = async (plan: SubscriptionPlan) => {
    if (plan.id === currentPlan) {
      alert("Vous êtes déjà sur ce plan")
      return
    }

    setSelectedPlan(plan)
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscription/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          newPlanId: plan.id
        })
      })

      if (response.ok) {
        alert(`Plan changé avec succès vers ${plan.name}`)
        router.push("/client")
      } else {
        alert("Erreur lors du changement de plan")
      }
    } catch (error) {
      console.error("Erreur lors du changement de plan:", error)
      alert("Erreur lors du changement de plan")
    } finally {
      setIsLoading(false)
    }
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
            <span className="text-xl font-bold text-gray-900">Inconnu OS</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/client")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Changer de plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez le plan qui correspond le mieux à vos besoins actuels
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all hover:shadow-sm ${
                plan.popular
                  ? "border-blue-500 shadow-sm scale-105"
                  : "border-gray-200 hover:border-blue-300"
              } ${
                currentPlan === plan.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Recommandé
                  </Badge>
                </div>
              )}

              {currentPlan === plan.id && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    Plan actuel
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    {plan.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}€
                  </span>
                  <span className="text-gray-600">/{plan.period}</span>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                  disabled={isLoading || currentPlan === plan.id}
                  onClick={() => handlePlanChange(plan)}
                >
                  {isLoading && selectedPlan?.id === plan.id 
                    ? "Changement en cours..." 
                    : currentPlan === plan.id 
                    ? "Plan actuel" 
                    : `Changer vers ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Informations */}
        <div className="text-center mt-12">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">Informations importantes</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Le changement de plan prend effet immédiatement</li>
              <li>• Vous ne serez facturé que pour la différence</li>
              <li>• Aucun engagement - vous pouvez changer à tout moment</li>
              <li>• Support disponible pour toute question</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 