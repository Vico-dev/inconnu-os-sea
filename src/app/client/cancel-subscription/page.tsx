"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertTriangle, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export default function CancelSubscriptionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [selectedReason, setSelectedReason] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const cancellationReasons = [
    {
      id: "too_expensive",
      label: "Trop cher",
      description: "Le prix ne correspond pas à mes attentes"
    },
    {
      id: "not_using",
      label: "Je n'utilise pas le service",
      description: "Je n'ai pas le temps ou l'envie d'utiliser la plateforme"
    },
    {
      id: "switching",
      label: "Je change de prestataire",
      description: "Je vais travailler avec une autre agence"
    },
    {
      id: "not_satisfied",
      label: "Pas satisfait du service",
      description: "Le service ne répond pas à mes besoins"
    },
    {
      id: "other",
      label: "Autre raison",
      description: "Une autre raison personnelle"
    }
  ]

  const handleCancelSubscription = async () => {
    if (!selectedReason) {
      alert("Veuillez sélectionner une raison de résiliation")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          reason: selectedReason === "other" ? reason : selectedReason,
          customReason: selectedReason === "other" ? reason : ""
        }),
      })

      if (response.ok) {
        setShowConfirmation(true)
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.message || "Impossible de résilier l'abonnement"}`)
      }
    } catch (error) {
      alert("Erreur lors de la résiliation")
    } finally {
      setIsLoading(false)
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Résiliation confirmée
            </h2>
            <p className="text-gray-600 mb-6">
              Votre abonnement a été résilié avec succès. Vous avez accès à vos services jusqu&apos;à la fin de la période payée.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Important</h3>
              <p className="text-sm text-blue-700">
                <strong>Mois engagé, mois dû :</strong> Votre abonnement reste actif jusqu&apos;à la fin de la période en cours.
              </p>
            </div>
            <Button onClick={() => router.push("/client")} className="w-full">
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/client" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Link>
          
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Résilier l&apos;abonnement</span>
          </div>
        </div>

        {/* Warning Card */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-2">
                  Attention : Cette action est irréversible
                </h3>
                <p className="text-orange-700 text-sm">
                  En résiliant votre abonnement, vous perdrez l&apos;accès à toutes les fonctionnalités premium à la fin de votre période de facturation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Plan Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Votre abonnement actuel</CardTitle>
            <CardDescription>
              Informations sur votre plan actuel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Plan Pro</h4>
                <p className="text-sm text-gray-600">Accompagnement quotidien + Optimisations</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">€1,200/mois</p>
                <Badge className="bg-green-100 text-green-800">Actif</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Raison de la résiliation</CardTitle>
            <CardDescription>
              Aidez-nous à améliorer notre service en nous indiquant pourquoi vous résiliez
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {cancellationReasons.map((reasonOption) => (
                <div key={reasonOption.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={reasonOption.id} id={reasonOption.id} />
                  <div className="flex-1">
                    <Label htmlFor={reasonOption.id} className="font-medium cursor-pointer">
                      {reasonOption.label}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {reasonOption.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            {selectedReason === "other" && (
              <div className="space-y-2">
                <Label htmlFor="custom-reason">Précisez votre raison</Label>
                <Textarea
                  id="custom-reason"
                  placeholder="Décrivez votre raison de résiliation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Mois engagé, mois dû</h3>
              <p className="text-sm text-blue-700">
                Votre abonnement reste actif jusqu&apos;à la fin de la période en cours. 
                Vous continuerez à bénéficier de tous nos services jusqu&apos;à cette date.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/client")}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={isLoading || !selectedReason}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Résiliation..." : "Confirmer la résiliation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 