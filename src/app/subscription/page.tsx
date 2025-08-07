"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, CreditCard, Building2 } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

// Charger Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

function PaymentForm({ selectedPlan, onSuccess }: { selectedPlan: SubscriptionPlan, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "sepa">("card")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || "Erreur lors de la soumission")
      setIsLoading(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/success`,
      },
    })

    if (confirmError) {
      setError(confirmError.message || "Erreur lors du paiement")
    } else {
      onSuccess()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Méthode de paiement</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setPaymentMethod("card")}
            className={`p-4 border rounded-lg flex items-center space-x-2 ${
              paymentMethod === "card" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Carte bancaire</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("sepa")}
            className={`p-4 border rounded-lg flex items-center space-x-2 ${
              paymentMethod === "sepa" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Prélèvement SEPA</span>
          </button>
        </div>
      </div>

      <PaymentElement />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isLoading || !stripe} 
        className="w-full"
      >
        {isLoading ? "Traitement..." : `Payer ${selectedPlan.price}€/${selectedPlan.period}`}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        En cliquant sur &quot;Payer&quot;, vous acceptez nos conditions générales de vente.
        <br />
        Vous pouvez annuler votre abonnement à tout moment.
      </p>
    </form>
  )
}

function SubscriptionPage() {
  const { session, status } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    // Vérifier si l'utilisateur a déjà un abonnement actif
    checkSubscriptionStatus()
  }, [session, status, router])

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/subscription/status?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.hasActiveSubscription) {
          router.push("/client")
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement:", error)
    }
  }

  const handlePlanSelection = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: plan.price,
          currency: "eur",
          paymentMethod: "card", // Par défaut, sera modifié par l'utilisateur
          planId: plan.id,
          userId: session?.user?.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setClientSecret(data.clientSecret)
      } else {
        console.error("Erreur lors de la création du paiement")
      }
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
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

  if (selectedPlan && clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Inconnu OS</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Finaliser votre abonnement
              </h1>
              <p className="text-gray-600">
                Plan {selectedPlan.name} - {selectedPlan.price}€/{selectedPlan.period}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informations de paiement</CardTitle>
                <CardDescription>
                  Sécurisé par Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm selectedPlan={selectedPlan} onSuccess={handlePaymentSuccess} />
                </Elements>
              </CardContent>
            </Card>
          </div>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre plan d&apos;accompagnement
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Commencez avec un essai gratuit de 14 jours, puis choisissez le plan qui correspond à vos besoins
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
              }`}
              onClick={() => handlePlanSelection(plan)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Recommandé
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
                  disabled={isLoading}
                >
                  {isLoading ? "Chargement..." : "Commencer l'essai gratuit"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Essai gratuit de 14 jours • Aucun engagement • Annulation à tout moment
          </p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage 