"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Mail, 
  Link, 
  CheckCircle, 
  Clock,
  User,
  Building
} from "lucide-react"

interface OnboardingData {
  calendlyLink: string
  gmailCalendarLink: string
  preferredContactMethod: 'calendly' | 'gmail' | 'both'
  availability: string
  specializations: string[]
  bio: string
  onboardingCompleted: boolean
}

export default function AMOnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    calendlyLink: "",
    gmailCalendarLink: "",
    preferredContactMethod: 'calendly',
    availability: "",
    specializations: [],
    bio: "",
    onboardingCompleted: false
  })

  const totalSteps = 4

  useEffect(() => {
    // Vérifier si l'utilisateur est un AM
    if (user && user.role !== "ACCOUNT_MANAGER") {
      router.push("/admin")
      return
    }

    // Charger les données existantes si l'onboarding a déjà commencé
    loadOnboardingData()
  }, [user, router])

  const loadOnboardingData = async () => {
    try {
      const response = await fetch("/api/am/onboarding")
      if (response.ok) {
        const data = await response.json()
        if (data.onboardingData) {
          setOnboardingData(data.onboardingData)
          setCurrentStep(data.currentStep || 1)
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    }
  }

  const saveOnboardingData = async (step: number) => {
    try {
      const response = await fetch("/api/am/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...onboardingData,
          currentStep: step
        }),
      })

      if (response.ok) {
        console.log("Données sauvegardées avec succès")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    }
  }

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      await saveOnboardingData(currentStep + 1)
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/am/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...onboardingData,
          onboardingCompleted: true
        }),
      })

      if (response.ok) {
        router.push("/am")
      }
    } catch (error) {
      console.error("Erreur lors de la finalisation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configuration des liens de prise de rendez-vous</h3>
              <p className="text-gray-600 mb-6">
                Configurez vos liens pour permettre aux clients de prendre rendez-vous avec vous.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="calendlyLink">Lien Calendly</Label>
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4 text-gray-400" />
                  <Input
                    id="calendlyLink"
                    placeholder="https://calendly.com/votre-nom"
                    value={onboardingData.calendlyLink}
                    onChange={(e) => updateField("calendlyLink", e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Votre lien Calendly pour la prise de rendez-vous
                </p>
              </div>

              <div>
                <Label htmlFor="gmailCalendarLink">Lien Google Calendar</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Input
                    id="gmailCalendarLink"
                    placeholder="https://calendar.google.com/..."
                    value={onboardingData.gmailCalendarLink}
                    onChange={(e) => updateField("gmailCalendarLink", e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Votre lien Google Calendar pour la prise de rendez-vous
                </p>
              </div>

              <div>
                <Label>Méthode de contact préférée</Label>
                <Select 
                  value={onboardingData.preferredContactMethod} 
                  onValueChange={(value: 'calendly' | 'gmail' | 'both') => updateField("preferredContactMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calendly">Calendly uniquement</SelectItem>
                    <SelectItem value="gmail">Google Calendar uniquement</SelectItem>
                    <SelectItem value="both">Les deux options</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Disponibilités et spécialisations</h3>
              <p className="text-gray-600 mb-6">
                Définissez vos disponibilités et vos domaines de spécialisation.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="availability">Disponibilités</Label>
                <Textarea
                  id="availability"
                  placeholder="Ex: Lundi-Vendredi 9h-18h, réunions possibles en soirée..."
                  value={onboardingData.availability}
                  onChange={(e) => updateField("availability", e.target.value)}
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Décrivez vos horaires de disponibilité pour les clients
                </p>
              </div>

              <div>
                <Label>Spécialisations</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "E-commerce", "SaaS", "B2B", "Services", 
                    "Formation", "Santé", "Finance", "Immobilier"
                  ].map((spec) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={spec}
                        checked={onboardingData.specializations.includes(spec)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateField("specializations", [...onboardingData.specializations, spec])
                          } else {
                            updateField("specializations", onboardingData.specializations.filter(s => s !== spec))
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={spec} className="text-sm">{spec}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Profil et présentation</h3>
              <p className="text-gray-600 mb-6">
                Présentez-vous aux clients et décrivez votre approche.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bio">Biographie professionnelle</Label>
                <Textarea
                  id="bio"
                  placeholder="Présentez votre expérience, votre approche et vos réussites..."
                  value={onboardingData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={5}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Cette description sera visible par vos clients
                </p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Récapitulatif et finalisation</h3>
              <p className="text-gray-600 mb-6">
                Vérifiez vos informations avant de finaliser votre profil.
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Informations de contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  {onboardingData.calendlyLink && (
                    <div className="flex items-center space-x-2">
                      <Link className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-blue-600">{onboardingData.calendlyLink}</span>
                    </div>
                  )}
                  {onboardingData.gmailCalendarLink && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-blue-600">{onboardingData.gmailCalendarLink}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Spécialisations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {onboardingData.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary">{spec}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {onboardingData.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>Biographie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{onboardingData.bio}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user || user.role !== "ACCOUNT_MANAGER") {
    return null
  }

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuration de votre profil AM
            </h1>
            <p className="text-gray-600">
              Étape {currentStep} sur {totalSteps}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i + 1 < currentStep 
                      ? "bg-green-500 text-white" 
                      : i + 1 === currentStep 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-200 text-gray-600"
                  }`}>
                    {i + 1 < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      i + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <Card>
            <CardContent className="p-6">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>

            <div className="flex space-x-2">
              {currentStep < totalSteps ? (
                <Button onClick={handleNext}>
                  Suivant
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  {isLoading ? "Finalisation..." : "Finaliser le profil"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 