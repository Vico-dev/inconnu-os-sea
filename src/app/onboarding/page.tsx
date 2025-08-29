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
  Calendar,
  Shield
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
    subtitle: "Complétez votre profil pour la facturation",
    icon: Building2,
    fields: ["companyName", "website", "industry", "goals", "teamSize", "currentChallenges"]
  },
  {
    id: 2,
    title: "Votre budget",
    subtitle: "Quel est votre budget publicitaire mensuel ?",
    icon: DollarSign,
    fields: ["dailyBudget"]
  },
  {
    id: 3,
    title: "Choisissez votre forfait",
    subtitle: "Sélectionnez le forfait qui correspond à votre budget média",
    icon: DollarSign,
    fields: ["selectedPlan"]
  },
  {
    id: 4,
    title: "Google Ads",
    subtitle: "Connectez votre compte Google Ads pour commencer",
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
  "Restaurant / Hôtellerie",
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
    ]
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
    ]
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
    ]
  }
]

const planData = {
  SMALL_BUDGET: {
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
    ]
  },
  MEDIUM_BUDGET: {
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
    ]
  },
  LARGE_BUDGET: {
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
    ]
  }
}

export default function OnboardingPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [savedProgress, setSavedProgress] = useState<any>(null)
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)

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
    const planFromUrl = searchParams?.get("plan")

    // Si non authentifié, rediriger vers la connexion en conservant le plan choisi
    if (!isAuthenticated) {
      router.push(`/login${planFromUrl ? `?plan=${planFromUrl}` : ""}`)
      return
    }

    // Pré-sélectionner le plan si fourni dans l'URL et pas encore choisi
    if (planFromUrl && !onboardingData.selectedPlan) {
      setOnboardingData(prev => ({ ...prev, selectedPlan: planFromUrl }))
    }

    // Vérifier si on revient de Google Ads
    const googleAdsConnected = searchParams?.get('googleAdsConnected')
    const step = searchParams?.get('step')
    
    if (googleAdsConnected === 'true') {
      setMessage("✅ Compte Google Ads connecté avec succès !")
      if (step) {
        setCurrentStep(parseInt(step))
      }
      // Nettoyer l'URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('googleAdsConnected')
      newUrl.searchParams.delete('step')
      window.history.replaceState({}, document.title, newUrl.pathname + newUrl.search)
    }
  }, [isAuthenticated, router, searchParams])

  // Charger l'avancement existant au montage
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch('/api/onboarding/load-progress')
        const data = await response.json()
        
        if (data.success) {
          setSavedProgress(data.progress)
          setCurrentStep(data.currentStep)
          
          // Pré-remplir les données si elles existent
          if (data.progress.company) {
            setOnboardingData(prev => ({
              ...prev,
              companyName: data.progress.company.companyName || '',
              website: data.progress.company.website || '',
              industry: data.progress.company.industry || '',
              teamSize: data.progress.company.size || ''
            }))
          }
          
          if (data.progress.budget) {
            setOnboardingData(prev => ({
              ...prev,
              dailyBudget: data.progress.budget.budget || ''
            }))
          }
          
          if (data.progress.plan) {
            setOnboardingData(prev => ({
              ...prev,
              selectedPlan: data.progress.plan.plan || ''
            }))
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      } finally {
        setIsLoadingProgress(false)
      }
    }
    
    if (isAuthenticated) {
      loadProgress()
    }
  }, [isAuthenticated])

  const currentStepData = onboardingSteps.find(step => step.id === currentStep)
  const progress = (currentStep / onboardingSteps.length) * 100

  const handleNext = async () => {
    // Sauvegarder l'étape actuelle avant de passer à la suivante
    if (currentStep === 1) {
      // Sauvegarder les données de l'entreprise
      await saveProgress('company', {
        companyName: onboardingData.companyName,
        industry: onboardingData.industry,
        size: onboardingData.teamSize,
        website: onboardingData.website
      })
    } else if (currentStep === 2) {
      // Sauvegarder le budget
      await saveProgress('budget', {
        budget: onboardingData.dailyBudget
      })
    } else if (currentStep === 3) {
      // Sauvegarder le plan sélectionné
      const recommended = getRecommendedPlan(onboardingData.dailyBudget || '') || 'MEDIUM_BUDGET'
      const planToUse = onboardingData.selectedPlan || recommended
      await saveProgress('plan', { plan: planToUse })
      
      // Rediriger vers le checkout Stripe
      window.location.href = `/client/checkout?plan=${planToUse}`
      return
    }

    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Fonction pour déterminer le plan recommandé selon le budget
  const getRecommendedPlan = (dailyBudget: string) => {
    if (!dailyBudget || isNaN(Number(dailyBudget))) return null
    
    const monthlyBudget = Number(dailyBudget) * 30
    
    if (monthlyBudget < 1000) {
      return 'SMALL_BUDGET'
    } else if (monthlyBudget >= 1000 && monthlyBudget < 5000) {
      return 'MEDIUM_BUDGET'
    } else if (monthlyBudget >= 5000) {
      return 'LARGE_BUDGET'
    }
    
    return null
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setOnboardingData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      
      // Si on change le budget journalier, mettre à jour automatiquement le plan recommandé
      if (field === "dailyBudget") {
        const recommendedPlan = getRecommendedPlan(value as string)
        if (recommendedPlan) {
          newData.selectedPlan = recommendedPlan
        }
      }
      
      return newData
    })
  }

  // Fonction pour sauvegarder l'avancement
  const saveProgress = async (step: string, data: any) => {
    try {
      await fetch('/api/onboarding/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data })
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleGoalToggle = (goal: string) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const handleGoogleAdsConnection = async () => {
    if (!user?.id) {
      setMessage("Erreur d'authentification")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const hasExistingAccount = onboardingData.googleAdsAccount === "yes"
      
      if (hasExistingAccount) {
        // Connexion à un compte existant
        setMessage("Connexion à votre compte Google Ads...")
        
        const response = await fetch("/api/onboarding/google-ads/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hasExistingAccount: true
          }),
        })

        if (response.ok) {
          const data = await response.json()
          // Rediriger vers Google OAuth
          window.location.href = data.authUrl
        } else {
          const error = await response.json()
          setMessage(error.error || "Erreur lors de la connexion Google Ads")
          setIsLoading(false)
        }
      } else {
        // Création d'un nouveau compte
        setMessage("Création de votre compte Google Ads...")
        
        const response = await fetch("/api/onboarding/google-ads/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName: onboardingData.companyName,
            website: onboardingData.website,
            industry: onboardingData.industry
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setMessage("✅ Compte Google Ads créé avec succès !")
          
          // Attendre un peu puis passer à l'étape suivante
          setTimeout(() => {
            setCurrentStep(7)
            setMessage("")
          }, 2000)
        } else {
          const error = await response.json()
          setMessage(error.error || "Erreur lors de la création du compte Google Ads")
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la gestion Google Ads:", error)
      setMessage("Erreur de connexion au serveur")
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user?.id) {
      setMessage("Erreur d'authentification")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      // S'assurer qu'un plan est sélectionné
      const planToUse = onboardingData.selectedPlan || 'MEDIUM_BUDGET'
      
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...onboardingData,
          selectedPlan: planToUse,
          userId: user?.id
        }),
      })

      if (response.ok) {
        setMessage("Onboarding terminé ! Redirection vers la souscription...")
        
        // Attendre un peu pour que l'utilisateur voie le message
        setTimeout(() => {
          // Rediriger directement vers le checkout avec le plan sélectionné
          window.location.href = `/client/checkout?plan=${planToUse}`
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

  const handleAppointment = async () => {
    if (!user?.id) {
      setMessage("Erreur d'authentification")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      // Sauvegarder l'onboarding sans finaliser
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...onboardingData,
          selectedPlan: onboardingData.selectedPlan || 'MEDIUM_BUDGET',
          userId: user?.id,
          appointmentMode: true // Mode RDV
        }),
      })

      if (response.ok) {
        setMessage("Onboarding sauvegardé ! Redirection vers la prise de RDV...")
        
        setTimeout(() => {
          // Rediriger vers la page de prise de RDV
          window.location.href = "/client/request-appointment"
        }, 1500)
      } else {
        const error = await response.json()
        setMessage(error.message || "Erreur lors de la sauvegarde")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      setMessage("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <Label htmlFor="companyName" className="text-lg font-medium">Nom de l&apos;entreprise</Label>
            <Input
              id="companyName"
              value={onboardingData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              placeholder="Votre entreprise"
              className="mt-1"
            />

            <Label htmlFor="website" className="text-lg font-medium mt-4">Site web</Label>
            <Input
              id="website"
              value={onboardingData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://votre-site.com"
              className="mt-1"
            />

            <Label htmlFor="industry" className="text-lg font-medium mt-4">Secteur d&apos;activité</Label>
            <select
              id="industry"
              value={onboardingData.industry}
              onChange={(e) => handleInputChange("industry", e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez votre secteur</option>
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            <Label className="text-lg font-medium mt-4 block">Vos objectifs principaux</Label>
            <div className="space-y-2">
              {goalOptions.map((goal) => (
                <label key={goal} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onboardingData.goals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOnboardingData(prev => ({
                          ...prev,
                          goals: [...prev.goals, goal]
                        }))
                      } else {
                        setOnboardingData(prev => ({
                          ...prev,
                          goals: prev.goals.filter(g => g !== goal)
                        }))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{goal}</span>
                </label>
              ))}
            </div>

            <Label htmlFor="teamSize" className="text-lg font-medium mt-4">Taille de l&apos;équipe</Label>
            <select
              id="teamSize"
              value={onboardingData.teamSize}
              onChange={(e) => handleInputChange("teamSize", e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez la taille</option>
              {teamSizeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <Label htmlFor="currentChallenges" className="text-lg font-medium mt-4">Vos principaux défis marketing</Label>
            <textarea
              id="currentChallenges"
              value={onboardingData.currentChallenges}
              onChange={(e) => handleInputChange("currentChallenges", e.target.value)}
              placeholder="Décrivez vos défis actuels..."
              rows={3}
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )

      case 2:
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

      case 3:
        // Déterminer le plan recommandé selon le budget
        let recommendedPlan = getRecommendedPlan(onboardingData.dailyBudget)
        
        // Si pas de budget ou budget invalide, utiliser MEDIUM_BUDGET par défaut
        if (!recommendedPlan) {
          recommendedPlan = 'MEDIUM_BUDGET'
        }
        
        // Assigner automatiquement le plan recommandé si pas encore sélectionné
        if (recommendedPlan && !onboardingData.selectedPlan) {
          setOnboardingData(prev => ({ ...prev, selectedPlan: recommendedPlan }))
        }
        
        const selectedPlanData = planData[recommendedPlan as keyof typeof planData] || planData.MEDIUM_BUDGET

        return (
          <div>
            <Label className="text-lg font-medium mb-4 block">Choisissez votre forfait</Label>
            <p className="text-sm text-gray-600 mb-6">
              Basé sur votre budget de <strong>{onboardingData.dailyBudget ? (Number(onboardingData.dailyBudget) * 30) : 0}€/mois</strong> 
              ({onboardingData.dailyBudget ? onboardingData.dailyBudget : 0}€/jour), 
              voici le forfait qui vous convient :
            </p>
            
            <div className="space-y-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    onboardingData.selectedPlan === plan.id
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => handleInputChange("selectedPlan", plan.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="text-2xl font-bold text-blue-600">
                        {plan.price}€<span className="text-sm text-gray-600">/mois</span>
                      </div>
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
                  ✓ Plan sélectionné : {selectedPlanData.name}
                </p>
              </div>
            )}
            
            {/* Garantie et preuve sociale */}
            <div className="mt-6 space-y-4">
              {/* Garantie */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Garantie sans engagement</h4>
                </div>
                <p className="text-sm text-green-800">
                  Annulez à tout moment. Aucun engagement, aucune pénalité.
                </p>
              </div>
              
              {/* Preuve sociale */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h4 className="font-medium text-purple-900">Résultats garantis</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">+40%</p>
                    <p className="text-purple-800">ROAS moyen</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">-30%</p>
                    <p className="text-purple-800">Coût acquisition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div>
            <Label className="text-lg font-medium mb-4 block">Configuration Google Ads</Label>
            <p className="text-sm text-gray-600 mb-4">
              Parfait ! Votre abonnement est actif. Maintenant configurons votre compte Google Ads pour commencer l&apos;optimisation de vos campagnes.
            </p>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Votre abonnement est actif ! Vous pouvez maintenant configurer Google Ads.
              </p>
            </div>
            
            {/* Choix du type de compte Google Ads */}
            <div className="space-y-4 mb-6">
              <Label className="text-base font-medium block">Avez-vous déjà un compte Google Ads ?</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange("googleAdsAccount", "yes")}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    onboardingData.googleAdsAccount === "yes"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Oui, j&apos;ai un compte</span>
                      <p className="text-sm text-gray-600 mt-1">Connecter mon compte existant</p>
                    </div>
                    {onboardingData.googleAdsAccount === "yes" && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange("googleAdsAccount", "no")}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    onboardingData.googleAdsAccount === "no"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Non, créer un compte</span>
                      <p className="text-sm text-gray-600 mt-1">Nous créons un compte pour vous</p>
                    </div>
                    {onboardingData.googleAdsAccount === "no" && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              </div>
            </div>
            
            {/* Explication des permissions */}
            {(onboardingData.googleAdsAccount === "yes" || onboardingData.googleAdsAccount === "no") && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Permissions nécessaires</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Pour optimiser vos campagnes efficacement, nous aurons besoin d&apos;accéder à :
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Vos données de campagne et performances</li>
                  <li>✅ Créer de nouvelles campagnes optimisées</li>
                  <li>✅ Modifier vos campagnes existantes</li>
                  <li>✅ Ajuster vos enchères et budgets</li>
                </ul>
                <p className="text-xs text-blue-700 mt-3">
                  Vos données restent confidentielles et ne sont utilisées que pour optimiser vos campagnes.
                </p>
                
                {/* Bouton de connexion Google Ads */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleGoogleAdsConnection}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion en cours...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {onboardingData.googleAdsAccount === "yes" 
                          ? "Connecter mon compte Google Ads" 
                          : "Créer et connecter un compte Google Ads"
                        }
                      </span>
                    )}
                  </button>
                </div>
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
    
    // Vérification spéciale pour l'étape 3 (sélection de plan)
    if (currentStep === 3) {
      // Permettre de continuer même sans plan sélectionné (il sera assigné automatiquement)
      return true
    }
    
    // Vérification spéciale pour l'étape 4 (Google Ads) - optionnel
    if (currentStep === 4) {
      // Toujours permettre de continuer car c'est optionnel
      return true
    }
    
    return currentFields.every(field => {
      const value = onboardingData[field as keyof OnboardingData]
      if (Array.isArray(value)) {
        return value.length > 0
      }
      
      // Vérification spéciale pour le budget (étape 2)
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
                        <div className="flex items-center gap-3">
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
                                Payer maintenant
                              </>
                            )}
                          </Button>
                          
                          <Button
                            onClick={handleAppointment}
                            disabled={isLoading}
                            variant="outline"
                            className="flex items-center"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Prendre RDV avec un AM
                          </Button>
                        </div>
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
                  </div>

                  {/* Message */}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-3 rounded-md ${
                        message.includes("terminé") || message.includes("réussi") || message.includes("✅") || message.includes("succès")
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