"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
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
import { useRouter } from "next/navigation"

interface OnboardingData {
  companyName: string
  website: string
  industry: string
  dailyBudget: string
  teamSize: string
  goals: string[]
  googleAdsAccount: string
  currentChallenges: string
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
    fields: ["monthlyBudget"]
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
  }
]

const goalOptions = [
  "Augmenter les ventes",
  "Générer plus de leads",
  "Améliorer le ROAS",
  "Élargir la clientèle",
  "Lancer un nouveau produit",
  "Optimiser les coûts d'acquisition"
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
    currentChallenges: ""
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

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
        setMessage("Onboarding terminé ! Redirection vers votre espace client...")
        
        // Attendre un peu pour que l'utilisateur voie le message
        setTimeout(() => {
          // Forcer la redirection vers le dashboard client
          window.location.href = "/client"
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
              <Label htmlFor="industry" className="text-lg font-medium">Secteur d'activité</Label>
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
                  <span className="font-medium">Oui, j'ai déjà un compte Google Ads</span>
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
                  <span className="font-medium">Non, je n'ai pas encore de compte</span>
                  {onboardingData.googleAdsAccount === "no" && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.companyName.trim() && onboardingData.industry
      case 2:
        return onboardingData.goals.length > 0
      case 3:
        return onboardingData.dailyBudget && parseInt(onboardingData.dailyBudget) > 0
      case 4:
        return onboardingData.teamSize
      case 5:
        return onboardingData.currentChallenges.trim().length > 10
      case 6:
        return onboardingData.googleAdsAccount
      default:
        return false
    }
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
                            Terminer l'onboarding
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