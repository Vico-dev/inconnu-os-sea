"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Globe, 
  Target, 
  DollarSign, 
  Users, 
  Check,
  TrendingUp,
  BarChart3,
  Calendar
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface OnboardingData {
  companyName: string
  website: string
  industry: string
  dailyBudget: string
  teamSize: string
  goals: string[]
  googleAdsAccount: string
  currentChallenges: string
  selectedPlan: string
}

const onboardingSteps = [
  {
    id: 1,
    title: "Votre entreprise",
    subtitle: "Commençons par mieux connaître votre entreprise",
    icon: Building2,
    fields: ["companyName", "website", "industry"]
  },
  {
    id: 2,
    title: "Vos objectifs",
    subtitle: "Quels sont vos objectifs principaux ?",
    icon: Target,
    fields: ["goals"]
  },
  {
    id: 3,
    title: "Votre budget",
    subtitle: "Quel est votre budget publicitaire mensuel ?",
    icon: DollarSign,
    fields: ["dailyBudget"]
  },
  {
    id: 4,
    title: "Votre équipe",
    subtitle: "Combien de personnes dans votre équipe ?",
    icon: Users,
    fields: ["teamSize"]
  },
  {
    id: 5,
    title: "Vos défis actuels",
    subtitle: "Quels sont vos principaux défis marketing ?",
    icon: TrendingUp,
    fields: ["currentChallenges"]
  },
  {
    id: 6,
    title: "Google Ads",
    subtitle: "Avez-vous déjà un compte Google Ads ?",
    icon: BarChart3,
    fields: ["googleAdsAccount"]
  },
  {
    id: 7,
    title: "Choisissez votre forfait",
    subtitle: "Sélectionnez le forfait qui correspond à votre budget média",
    icon: DollarSign,
    fields: ["selectedPlan"]
  }
]

const goalOptions = [
  "Augmenter les ventes",
  "Générer plus de leads",
  "Améliorer le ROAS",
  "Élargir la clientèle",
  "Lancer un nouveau produit",
  "Optimiser les coûts d&apos;acquisition"
]

const industryOptions = [
  "E-commerce",
  "SaaS / Tech",
  "Services B2B",
  "Restaurant / Horeca",
  "Immobilier",
  "Santé / Médical",
  "Formation / Éducation",
  "Finance / Assurance",
  "Mode / Beauté",
  "Autre"
]



const teamSizeOptions = [
  { label: "1-5 personnes", value: "1-5" },
  { label: "6-10 personnes", value: "6-10" },
  { label: "11-25 personnes", value: "11-25" },
  { label: "26-50 personnes", value: "26-50" },
  { label: "Plus de 50 personnes", value: "50+" }
]

export default function OnboardingPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: "",
    website: "",
    industry: "",
    dailyBudget: "",
    teamSize: "",
    goals: [],
    googleAdsAccount: "",
    currentChallenges: "",
    selectedPlan: ""
  })

  useEffect(() => {
    const planFromUrl = searchParams.get("plan")

    // Si non authentifié, rediriger vers la connexion en conservant le plan choisi
    if (!isAuthenticated) {
      router.push(`/login${planFromUrl ? `?plan=${planFromUrl}` : ""}`)
      return
    }

    // Pré-sélectionner le plan si fourni dans l'URL et pas encore choisi
    if (planFromUrl && !onboardingData.selectedPlan) {
      setOnboardingData(prev => ({ ...prev, selectedPlan: planFromUrl }))
    }
  }, [isAuthenticated, router, searchParams])

  const currentStepData = onboardingSteps.find(step => step.id === currentStep)
  const progress = (currentStep / onboardingSteps.length) * 100

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGoalToggle = (goal: string) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...onboardingData,
          userId: user?.id
        }),
      })

      if (response.ok) {
        setMessage("Onboarding terminé ! Redirection vers la souscription...")
        
        // Attendre un peu pour que l'utilisateur voie le message
        setTimeout(() => {
          // Rediriger directement vers le checkout avec le plan sélectionné
          window.location.href = `/client/checkout?plan=${onboardingData.selectedPlan}`
        }, 1500)
      } else {
        const error = await response.json()
        setMessage(error.message || "Erreur lors de l'onboarding")
      }
    } catch (error) {
      console.error("Erreur lors de l'onboarding:", error)
      setMessage("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="companyName" className="text-lg font-medium">Nom de votre entreprise</Label>
              <Input
                id="companyName"
                value={onboardingData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                className="mt-2 text-lg p-4"
                placeholder="Nom de votre entreprise"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="website" className="text-lg font-medium">Site web</Label>
              <Input
                id="website"
                value={onboardingData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="mt-2 text-lg p-4"
                placeholder="https://votre-site.com"
              />
            </div>
            <div>
              <Label htmlFor="industry" className="text-lg font-medium">Secteur d&apos;activité</Label>
              <select
                id="industry"
                value={onboardingData.industry}
                onChange={(e) => handleInputChange("industry", e.target.value)}
                className="mt-2 w-full text-lg p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionnez votre secteur</option>
                {industryOptions.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div>
            <Label className="text-lg font-medium mb-4 block">Sélectionnez vos objectifs principaux</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalOptions.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    onboardingData.goals.includes(goal)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal}</span>
                    {onboardingData.goals.includes(goal) && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div>
            <Label htmlFor="dailyBudget" className="text-lg font-medium">Budget publicitaire journalier</Label>
            <p className="text-sm text-gray-600 mb-4">Saisissez votre budget journalier moyen en euros</p>
            <div className="space-y-4">
              <div>
                <Input
                  id="dailyBudget"
                  type="number"
                  value={onboardingData.dailyBudget}
                  onChange={(e) => handleInputChange("dailyBudget", e.target.value)}
                  className="text-lg p-4"
                  placeholder="Ex: 50"
                  min="0"
                  step="1"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-1">Budget en euros par jour</p>
              </div>
              
              {onboardingData.dailyBudget && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Budget mensuel estimé</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {parseInt(onboardingData.dailyBudget) * 30}€
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Calculé sur 30 jours</p>
                      <p className="text-xs text-gray-500">({onboardingData.dailyBudget}€ × 30 jours)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div>
            <Label className="text-lg font-medium mb-4 block">Taille de votre équipe</Label>
            <div className="space-y-3">
              {teamSizeOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange("teamSize", option.value)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    onboardingData.teamSize === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    {onboardingData.teamSize === option.value && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div>
            <Label htmlFor="currentChallenges" className="text-lg font-medium">Vos défis actuels</Label>
            <textarea
              id="currentChallenges"
              value={onboardingData.currentChallenges}
              onChange={(e) => handleInputChange("currentChallenges", e.target.value)}
              className="mt-2 w-full text-lg p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Décrivez vos principaux défis marketing actuels..."
              autoFocus
            />
          </div>
        )

      case 6:
        return (
          <div>
            <Label className="text-lg font-medium mb-4 block">Compte Google Ads</Label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleInputChange("googleAdsAccount", "yes")}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  onboardingData.googleAdsAccount === "yes"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Oui, j&apos;ai déjà un compte Google Ads</span>
                  {onboardingData.googleAdsAccount === "yes" && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("googleAdsAccount", "no")}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  onboardingData.googleAdsAccount === "no"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Non, je n&apos;ai pas encore de compte</span>
                  {onboardingData.googleAdsAccount === "no" && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-600 mb-4">
                Basé sur vos informations, voici nos forfaits recommandés :
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  id: 'SMALL_BUDGET',
                  name: 'Petit Chasseur',
                  price: 200,
                  description: 'Budget média < 1000€/mois',
                  features: ['Audit mensuel', 'Optimisations techniques', 'Support email'],
                  popular: false
                },
                {
                  id: 'MEDIUM_BUDGET',
                  name: 'Chasseur',
                  price: 400,
                  description: 'Budget média 1000€-5000€/mois',
                  features: ['Call hebdomadaire', 'Optimisations temps réel', 'Support prioritaire'],
                  popular: true
                },
                {
                  id: 'LARGE_BUDGET',
                  name: 'Grand Chasseur',
                  price: 600,
                  description: 'Budget média 5000€-10000€/mois',
                  features: ['Account manager dédié', 'Support 24/7', 'Stratégie personnalisée'],
                  popular: false
                }
              ].map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    onboardingData.selectedPlan === plan.id
                      ? 'border-2 border-blue-500 bg-blue-50'
                      : 'border border-gray-200 hover:border-blue-300'
                  } ${plan.popular ? 'ring-2 ring-blue-300' : ''}`}
                  onClick={() => handleInputChange("selectedPlan", plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                      Recommandé
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900">
                      {plan.price}€<span className="text-sm text-gray-600">/mois</span>
                    </div>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {onboardingData.selectedPlan && (
              <div className="text-center mt-6">
                <p className="text-green-600 font-medium">
                  ✓ Plan sélectionné : {onboardingData.selectedPlan === 'SMALL_BUDGET' ? 'Petit Chasseur' : 
                    onboardingData.selectedPlan === 'MEDIUM_BUDGET' ? 'Chasseur' : 'Grand Chasseur'}
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    const currentFields = onboardingSteps[currentStep - 1]?.fields || []
    
    // Vérification spéciale pour l'étape 7 (sélection de plan)
    if (currentStep === 7) {
      return onboardingData.selectedPlan !== ""
    }
    
    return currentFields.every(field => {
      const value = onboardingData[field as keyof OnboardingData]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      
      // Vérification spéciale pour le budget (étape 3)
      if (field === "dailyBudget") {
        return value && !isNaN(Number(value)) && Number(value) > 0
      }
      
      return value && value.trim() !== ""
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Agence Inconnu</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue {user?.name} !</h1>
          <p className="text-gray-600">Complétez votre profil pour personnaliser votre expérience</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Étape {currentStep} sur {onboardingSteps.length}</span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xs">
                <CardContent className="p-8">
                  {/* Step Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {currentStepData?.icon && <currentStepData.icon className="w-8 h-8 text-blue-600" />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentStepData?.title}
                    </h2>
                    <p className="text-gray-600">
                      {currentStepData?.subtitle}
                    </p>
                  </div>

                  {/* Step Content */}
                  <div className="mb-8">
                    {renderStepContent()}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className="flex items-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Précédent
                    </Button>

                    <div className="flex items-center gap-2">
                      {currentStep === onboardingSteps.length ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!canProceed() || isLoading}
                          className="flex items-center bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Finalisation...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Terminer l&apos;onboarding
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          disabled={!canProceed()}
                          className="flex items-center bg-blue-600 hover:bg-blue-700"
                        >
                          Suivant
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}

                      {(() => {
                        const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "/client/request-appointment"
                        const isExternal = calendlyUrl.startsWith("http")
                        return isExternal ? (
                          <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Prendre RDV
                            </Button>
                          </a>
                        ) : (
                          <Link href={calendlyUrl}>
                            <Button variant="outline" className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Prendre RDV
                            </Button>
                          </Link>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Message */}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-3 rounded-md ${
                        message.includes("terminé") || message.includes("réussi") 
                          ? "bg-green-50 text-green-800 border border-green-200" 
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {message}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 