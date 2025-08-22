"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Users, 
  ShoppingCart, 
  Search,
  Brain,
  Check,
  Loader2
} from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  company: string
  budget: number
  accountManager?: string
}

interface CampaignCreationWizardProps {
  isOpen: boolean
  onClose: () => void
  selectedClient: Client | null
}

interface CampaignData {
  // Étape 1: Le besoin
  objective: 'LEADS' | 'SALES_ECOMMERCE' | 'SALES_SAAS' | 'AWARENESS'
  targetAudience: string
  conversionGoal: string
  
  // Étape 2: La cible
  targetDemographics: {
    ageRange: string
    gender: string
    location: string
    interests: string[]
  }
  targetBehavior: {
    purchaseIntent: string
    searchBehavior: string
    onlineHabits: string
  }
  
  // Étape 3: Le service/produit
  mainOffer: string
  valueProposition: string
  pricing: string
  uniqueBenefits: string[]
  
  // Étape 4: Les mots-clés
  primaryKeywords: string[]
  keywordIntent: 'COMMERCIAL' | 'INFORMATIONAL' | 'TRANSACTIONAL'
  searchVolume: 'HIGH' | 'MEDIUM' | 'LOW'
  competition: 'HIGH' | 'MEDIUM' | 'LOW'
}

export function CampaignCreationWizard({ isOpen, onClose, selectedClient }: CampaignCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [campaignData, setCampaignData] = useState<CampaignData>({
    objective: 'LEADS',
    targetAudience: '',
    conversionGoal: '',
    targetDemographics: {
      ageRange: '',
      gender: '',
      location: '',
      interests: []
    },
    targetBehavior: {
      purchaseIntent: '',
      searchBehavior: '',
      onlineHabits: ''
    },
    mainOffer: '',
    valueProposition: '',
    pricing: '',
    uniqueBenefits: []
  } as CampaignData)

  const steps = [
    { id: 1, title: "Le Besoin", description: "Objectif et audience cible", icon: Target },
    { id: 2, title: "La Cible", description: "Démographie et comportement", icon: Users },
    { id: 3, title: "Le Service", description: "Offre et valeur ajoutée", icon: ShoppingCart },
    { id: 4, title: "Mots-clés", description: "5 mots-clés principaux", icon: Search }
  ]

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateCampaign = async () => {
    setIsLoading(true)
    
    try {
      // Simuler la création de campagne
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("🎯 Campagne créée:", {
        client: selectedClient,
        campaignData
      })
      
      // Fermer le wizard
      onClose()
      setCurrentStep(1)
      setCampaignData({} as CampaignData)
      
    } catch (error) {
      console.error("Erreur création campagne:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCampaignData = (field: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedField = (parent: string, field: string, value: any) => {
    setCampaignData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof CampaignData],
        [field]: value
      }
    }))
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Quel est votre objectif principal ?</h3>
        <p className="text-muted-foreground mb-4">
          Définissez le but de cette campagne pour mieux cibler votre audience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${
            campaignData.objective === 'LEADS' ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => updateCampaignData('objective', 'LEADS')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Génération de Leads</h4>
                <p className="text-sm text-muted-foreground">Capturer des prospects qualifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${
            campaignData.objective === 'SALES_ECOMMERCE' ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => updateCampaignData('objective', 'SALES_ECOMMERCE')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Ventes E-commerce</h4>
                <p className="text-sm text-muted-foreground">Vendre des produits physiques</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${
            campaignData.objective === 'SALES_SAAS' ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => updateCampaignData('objective', 'SALES_SAAS')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Souscription SaaS</h4>
                <p className="text-sm text-muted-foreground">Convertir en abonnements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${
            campaignData.objective === 'AWARENESS' ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => updateCampaignData('objective', 'AWARENESS')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">Notoriété</h4>
                <p className="text-sm text-muted-foreground">Augmenter la visibilité</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="targetAudience">Audience cible principale</Label>
          <Input
            id="targetAudience"
            placeholder="Ex: Dirigeants d'entreprises, 25-45 ans, secteur tech..."
            value={campaignData.targetAudience}
            onChange={(e) => updateCampaignData('targetAudience', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="conversionGoal">Objectif de conversion</Label>
          <Textarea
            id="conversionGoal"
            placeholder="Ex: Obtenir 50 leads qualifiés par mois avec un coût par lead < 50€"
            value={campaignData.conversionGoal}
            onChange={(e) => updateCampaignData('conversionGoal', e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Définissez votre cible précise</h3>
        <p className="text-muted-foreground mb-4">
          Plus votre cible est précise, plus vos campagnes seront performantes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Démographie</h4>
          
          <div>
            <Label htmlFor="ageRange">Tranche d'âge</Label>
            <Select 
              value={campaignData.targetDemographics.ageRange}
              onValueChange={(value) => updateNestedField('targetDemographics', 'ageRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-24">18-24 ans</SelectItem>
                <SelectItem value="25-34">25-34 ans</SelectItem>
                <SelectItem value="35-44">35-44 ans</SelectItem>
                <SelectItem value="45-54">45-54 ans</SelectItem>
                <SelectItem value="55+">55+ ans</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gender">Genre</Label>
            <Select 
              value={campaignData.targetDemographics.gender}
              onValueChange={(value) => updateNestedField('targetDemographics', 'gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="male">Hommes</SelectItem>
                <SelectItem value="female">Femmes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              placeholder="Ex: France, Paris, Île-de-France..."
              value={campaignData.targetDemographics.location}
              onChange={(e) => updateNestedField('targetDemographics', 'location', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Comportement</h4>
          
          <div>
            <Label htmlFor="purchaseIntent">Intention d'achat</Label>
            <Select 
              value={campaignData.targetBehavior.purchaseIntent}
              onValueChange={(value) => updateNestedField('targetBehavior', 'purchaseIntent', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ready">Prêt à acheter</SelectItem>
                <SelectItem value="researching">En recherche</SelectItem>
                <SelectItem value="awareness">Prise de conscience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="searchBehavior">Comportement de recherche</Label>
            <Textarea
              id="searchBehavior"
              placeholder="Ex: Recherche sur Google, comparaison de prix, lecture d'avis..."
              value={campaignData.targetBehavior.searchBehavior}
              onChange={(e) => updateNestedField('targetBehavior', 'searchBehavior', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="onlineHabits">Habitudes en ligne</Label>
            <Textarea
              id="onlineHabits"
              placeholder="Ex: Utilise les réseaux sociaux, lit des blogs, regarde des vidéos..."
              value={campaignData.targetBehavior.onlineHabits}
              onChange={(e) => updateNestedField('targetBehavior', 'onlineHabits', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Définissez votre offre</h3>
        <p className="text-muted-foreground mb-4">
          Clarifiez ce que vous vendez et pourquoi les clients devraient vous choisir
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="mainOffer">Offre principale</Label>
          <Input
            id="mainOffer"
            placeholder="Ex: Formation en marketing digital, Logiciel de gestion, Produits bio..."
            value={campaignData.mainOffer}
            onChange={(e) => updateCampaignData('mainOffer', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="valueProposition">Proposition de valeur</Label>
          <Textarea
            id="valueProposition"
            placeholder="Ex: Nous aidons les entreprises à doubler leurs ventes en ligne en 3 mois..."
            value={campaignData.valueProposition}
            onChange={(e) => updateCampaignData('valueProposition', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="pricing">Positionnement prix</Label>
          <Select 
            value={campaignData.pricing}
            onValueChange={(value) => updateCampaignData('pricing', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="premium">Premium (haut de gamme)</SelectItem>
              <SelectItem value="mid-range">Moyenne gamme</SelectItem>
              <SelectItem value="budget">Économique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Avantages concurrentiels (3 maximum)</Label>
          <div className="space-y-2">
            {[1, 2, 3].map((index) => (
              <Input
                key={index}
                placeholder={`Avantage ${index} (ex: Garantie 30 jours, Support 24/7, Prix imbattable...)`}
                value={campaignData.uniqueBenefits[index - 1] || ''}
                onChange={(e) => {
                  const newBenefits = [...(campaignData.uniqueBenefits || [])]
                  newBenefits[index - 1] = e.target.value
                  updateCampaignData('uniqueBenefits', newBenefits)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Sélectionnez vos mots-clés principaux</h3>
        <p className="text-muted-foreground mb-4">
          Choisissez 5 mots-clés essentiels pour commencer votre campagne
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Mots-clés principaux</h4>
          
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index}>
              <Label htmlFor={`keyword${index}`}>Mot-clé {index}</Label>
              <Input
                id={`keyword${index}`}
                placeholder={`Ex: formation marketing digital, logiciel gestion, produits bio...`}
                value={campaignData.primaryKeywords[index - 1] || ''}
                onChange={(e) => {
                  const newKeywords = [...(campaignData.primaryKeywords || [])]
                  newKeywords[index - 1] = e.target.value
                  updateCampaignData('primaryKeywords', newKeywords)
                }}
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Paramètres de ciblage</h4>
          
          <div>
            <Label htmlFor="keywordIntent">Intent de recherche</Label>
            <Select 
              value={campaignData.keywordIntent}
              onValueChange={(value) => updateCampaignData('keywordIntent', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMMERCIAL">Commercial (prêt à acheter)</SelectItem>
                <SelectItem value="INFORMATIONAL">Informationnel (recherche)</SelectItem>
                <SelectItem value="TRANSACTIONAL">Transactionnel (comparaison)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="searchVolume">Volume de recherche</Label>
            <Select 
              value={campaignData.searchVolume}
              onValueChange={(value) => updateCampaignData('searchVolume', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">Élevé (10k+ recherches/mois)</SelectItem>
                <SelectItem value="MEDIUM">Moyen (1k-10k recherches/mois)</SelectItem>
                <SelectItem value="LOW">Faible (&lt; 1k recherches/mois)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="competition">Niveau de concurrence</Label>
            <Select 
              value={campaignData.competition}
              onValueChange={(value) => updateCampaignData('competition', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">Élevé (concurrence forte)</SelectItem>
                <SelectItem value="MEDIUM">Moyen (concurrence modérée)</SelectItem>
                <SelectItem value="LOW">Faible (peu de concurrence)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">Génération IA</h4>
        </div>
        <p className="text-sm text-blue-700">
          L'IA va analyser vos mots-clés et générer des suggestions d'optimisation, 
          des headlines d'annonces et des descriptions personnalisées.
        </p>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return renderStep1()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Créer une Campagne - {selectedClient?.company}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-4">
          <Progress value={(currentStep / 4) * 100} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Étape {currentStep} sur 4</span>
            <span>{Math.round((currentStep / 4) * 100)}% terminé</span>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-between items-center">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.id ? 'bg-primary text-white' : 'bg-muted'
                }`}>
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{step.title}</p>
                  <p className="text-xs">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Step content */}
        <div className="py-6">
          {renderCurrentStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreateCampaign} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Créer la Campagne avec IA
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 