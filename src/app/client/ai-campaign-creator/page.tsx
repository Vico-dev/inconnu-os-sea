"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Check, Wand2, Target, ShoppingCart, Image, Search } from "lucide-react"

interface CampaignFormData {
  name: string
  budget: number
  type: 'SEARCH' | 'SHOPPING' | 'PMAX' | 'DISPLAY'
  industry: string
  website: string
  goals: string[]
  targetAudience: {
    ageRange: string[]
    locations: string[]
    interests: string[]
  }
}

const goalOptions = [
  "Augmenter les ventes",
  "Générer plus de leads",
  "Améliorer le ROAS",
  "Élargir la clientèle",
  "Lancer un nouveau produit",
  "Optimiser les coûts d'acquisition"
]

const ageRanges = [
  "18-24",
  "25-34", 
  "35-44",
  "45-54",
  "55-64",
  "65+"
]

const locations = [
  "France",
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Europe"
]

export default function AICampaignCreatorPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [generatedCampaign, setGeneratedCampaign] = useState<any>(null)

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    budget: 0,
    type: 'SEARCH',
    industry: "",
    website: "",
    goals: [],
    targetAudience: {
      ageRange: [],
      locations: [],
      interests: []
    }
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const handleAudienceChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: prev.targetAudience[field as keyof typeof prev.targetAudience].includes(value)
          ? prev.targetAudience[field as keyof typeof prev.targetAudience].filter((item: string) => item !== value)
          : [...prev.targetAudience[field as keyof typeof prev.targetAudience], value]
      }
    }))
  }

  const createCampaign = async () => {
    if (!user?.id) {
      setMessage("Erreur d'authentification")
      return
    }

    setIsLoading(true)
    setMessage("🤖 Création de campagne avec IA...")

    try {
      const response = await fetch("/api/ai/create-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCampaign(data.campaign)
        setMessage("✅ Campagne créée avec succès par l'IA !")
      } else {
        const error = await response.json()
        setMessage(error.error || "Erreur lors de la création")
      }
    } catch (error) {
      console.error("Erreur création campagne:", error)
      setMessage("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'SEARCH':
        return <Search className="w-5 h-5" />
      case 'SHOPPING':
        return <ShoppingCart className="w-5 h-5" />
      case 'PMAX':
        return <Image className="w-5 h-5" />
      case 'DISPLAY':
        return <Target className="w-5 h-5" />
      default:
        return <Wand2 className="w-5 h-5" />
    }
  }

  const getCampaignTypeDescription = (type: string) => {
    switch (type) {
      case 'SEARCH':
        return "Campagnes de recherche avec mots-clés optimisés par IA"
      case 'SHOPPING':
        return "Campagnes shopping avec sélection automatique des meilleurs produits"
      case 'PMAX':
        return "Campagnes Performance Max avec assets créatifs générés par IA"
      case 'DISPLAY':
        return "Campagnes display avec audiences ciblées automatiquement"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Créateur de Campagnes IA</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer des Campagnes Google Ads avec l'IA</h1>
          <p className="text-gray-600">L'IA analyse votre business et crée des campagnes optimisées automatiquement</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulaire de création */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                <span>Configuration de la Campagne</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de la campagne</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: Campagne E-commerce Q4"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget journalier (€)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", Number(e.target.value))}
                    placeholder="50"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type de campagne</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEARCH">
                        <div className="flex items-center space-x-2">
                          <Search className="w-4 h-4" />
                          <span>Search</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SHOPPING">
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="w-4 h-4" />
                          <span>Shopping</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PMAX">
                        <div className="flex items-center space-x-2">
                          <Image className="w-4 h-4" />
                          <span>Performance Max</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="DISPLAY">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4" />
                          <span>Display</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-1">
                    {getCampaignTypeDescription(formData.type)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="industry">Secteur d'activité</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    placeholder="Ex: E-commerce, SaaS, Services B2B"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://votre-site.com"
                  />
                </div>
              </div>

              {/* Objectifs */}
              <div>
                <Label className="text-base font-medium">Objectifs principaux</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {goalOptions.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.goals.includes(goal)}
                        onCheckedChange={() => handleGoalToggle(goal)}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience cible */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Audience cible</Label>
                
                <div>
                  <Label className="text-sm">Tranches d'âge</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {ageRanges.map(age => (
                      <Button
                        key={age}
                        variant={formData.targetAudience.ageRange.includes(age) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAudienceChange("ageRange", age)}
                      >
                        {age}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Localisations</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {locations.map(location => (
                      <Button
                        key={location}
                        variant={formData.targetAudience.locations.includes(location) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAudienceChange("locations", location)}
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bouton de création */}
              <Button
                onClick={createCampaign}
                disabled={isLoading || !formData.name || !formData.budget || !formData.industry}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Création en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-5 h-5" />
                    <span>Créer la Campagne avec IA</span>
                  </div>
                )}
              </Button>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aperçu de la campagne générée */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Aperçu de la Campagne</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedCampaign ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getCampaignTypeIcon(generatedCampaign.type)}
                      <h3 className="font-semibold">{generatedCampaign.name}</h3>
                      <Badge variant="secondary">{generatedCampaign.type}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Budget:</span> {generatedCampaign.budget}€/jour
                      </div>
                      <div>
                        <span className="font-medium">Budget mensuel:</span> {generatedCampaign.budget * 30}€
                      </div>
                    </div>

                    {generatedCampaign.keywords && (
                      <div>
                        <h4 className="font-medium mb-2">Mots-clés générés:</h4>
                        <div className="flex flex-wrap gap-2">
                          {generatedCampaign.keywords.slice(0, 5).map((keyword: any, index: number) => (
                            <Badge key={index} variant="outline">
                              {keyword.keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedCampaign.ads && (
                      <div>
                        <h4 className="font-medium mb-2">Annonces générées:</h4>
                        <div className="space-y-2">
                          {generatedCampaign.ads.map((ad: any, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium text-blue-600">{ad.headline1}</div>
                              <div className="text-sm text-gray-600">{ad.description1}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Remplissez le formulaire et créez votre première campagne avec IA</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fonctionnalités IA */}
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Génération automatique de mots-clés</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Création d'annonces optimisées</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Sélection intelligente des produits (Shopping)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Génération d'assets créatifs (PMax)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Optimisation automatique continue</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 