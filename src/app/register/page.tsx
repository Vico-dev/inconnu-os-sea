"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Building2, User, Mail, Lock, Check } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface FormData {
  firstName: string
  lastName: string
  email: string
  company: string
  password: string
  confirmPassword: string
}

const steps = [
  {
    id: 1,
    title: "Quel est votre nom ?",
    subtitle: "Nous avons besoin de votre nom pour créer votre compte",
    field: "name",
    icon: User
  },
  {
    id: 2,
    title: "Votre email professionnel",
    subtitle: "Nous l&apos;utiliserons pour vous connecter et vous envoyer des rapports",
    field: "email",
    icon: Mail
  },
  {
    id: 3,
    title: "Votre entreprise",
    subtitle: "Le nom de votre entreprise (optionnel)",
    field: "company",
    icon: Building2
  },
  {
    id: 4,
    title: "Créez votre mot de passe",
    subtitle: "Choisissez un mot de passe sécurisé",
    field: "password",
    icon: Lock
  },
  {
    id: 5,
    title: "Confirmez votre mot de passe",
    subtitle: "Répétez votre mot de passe pour confirmer",
    field: "confirmPassword",
    icon: Lock
  }
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const currentStepData = steps.find(step => step.id === currentStep)
  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setMessage("")

    // Validation finale
    if (formData.password !== formData.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "client"
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Compte créé avec succès ! Redirection...")
        setTimeout(() => {
          window.location.href = "/login?message=Inscription réussie ! Vous pouvez maintenant vous connecter."
        }, 2000)
      } else {
        setMessage(data.message || "Erreur lors de l&apos;inscription")
      }
    } catch (error) {
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
              <Label htmlFor="firstName" className="text-lg font-medium">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="mt-2 text-lg p-4"
                placeholder="Votre prénom"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-lg font-medium">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="mt-2 text-lg p-4"
                placeholder="Votre nom"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div>
            <Label htmlFor="email" className="text-lg font-medium">Email professionnel</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="mt-2 text-lg p-4"
              placeholder="votre@email.com"
              autoFocus
            />
          </div>
        )

      case 3:
        return (
          <div>
            <Label htmlFor="company" className="text-lg font-medium">Nom de votre entreprise</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className="mt-2 text-lg p-4"
              placeholder="Nom de votre entreprise (optionnel)"
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-2">Ce champ est optionnel</p>
          </div>
        )

      case 4:
        return (
          <div>
            <Label htmlFor="password" className="text-lg font-medium">Mot de passe</Label>
            <div className="relative mt-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="text-lg p-4 pr-12"
                placeholder="Votre mot de passe"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Minimum 6 caractères</p>
          </div>
        )

      case 5:
        return (
          <div>
            <Label htmlFor="confirmPassword" className="text-lg font-medium">Confirmez votre mot de passe</Label>
            <div className="relative mt-2">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="text-lg p-4 pr-12"
                placeholder="Répétez votre mot de passe"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
        return formData.firstName.trim() && formData.lastName.trim()
      case 2:
        return formData.email.trim() && formData.email.includes("@")
      case 3:
        return true // Optionnel
      case 4:
        return formData.password.length >= 6
      case 5:
        return formData.confirmPassword === formData.password
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Agence Inconnu</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Étape {currentStep} sur {steps.length}</span>
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
              <Card className="border-0 shadow-sm">
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

                    {currentStep === steps.length ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={!canProceed() || isLoading}
                        className="flex items-center bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Création...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Créer mon compte
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
                        message.includes("succès") || message.includes("réussi") 
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

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 