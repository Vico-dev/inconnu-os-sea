'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Target, Search, ShoppingCart, Zap, Brain, Settings, Users, DollarSign, TrendingUp } from 'lucide-react'

interface CampaignData {
  name: string
  objective: 'SALES' | 'LEADS' | 'AWARENESS'
  type: 'SEARCH' | 'SHOPPING' | 'PMAX' | 'DISPLAY'
  budget: number
  targetAudience: string
  keywords: string[]
  locations: string[]
  language: string
  description: string
}

interface AISuggestions {
  keywords: string[]
  budgetRecommendation: number
  targetingRecommendations: string[]
  optimizationTips: string[]
}

interface GoogleAdsAccount {
  id: string
  name: string
  customerId: string
  status: string
  clientName?: string
  clientEmail?: string
}

interface CampaignCreatorProps {
  selectedAccount?: GoogleAdsAccount
}

export function CampaignCreator({ selectedAccount }: CampaignCreatorProps) {
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    objective: 'SALES',
    type: 'SEARCH',
    budget: 0,
    targetAudience: '',
    keywords: [],
    locations: [],
    language: 'fr',
    description: ''
  })

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [newKeyword, setNewKeyword] = useState('')
  const [newLocation, setNewLocation] = useState('')

  const generateAISuggestions = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/campaign-creator/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })
      
      if (response.ok) {
        const suggestions = await response.json()
        setAiSuggestions(suggestions)
      }
    } catch (error) {
      console.error('Erreur lors de la génération des suggestions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !campaignData.keywords.includes(newKeyword.trim())) {
      setCampaignData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setCampaignData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const addLocation = () => {
    if (newLocation.trim() && !campaignData.locations.includes(newLocation.trim())) {
      setCampaignData(prev => ({
        ...prev,
        locations: [...prev.locations, newLocation.trim()]
      }))
      setNewLocation('')
    }
  }

  const removeLocation = (location: string) => {
    setCampaignData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }))
  }

  const createCampaign = async () => {
    try {
      const response = await fetch('/api/admin/campaign-creator/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignData,
          clientAccountId: selectedAccount?.id
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Campagne créée:', result)
        // Afficher un message de succès
        alert('Campagne créée avec succès !')
      } else {
        const error = await response.json()
        console.error('Erreur:', error)
        alert(`Erreur: ${error.error || 'Erreur lors de la création'}`)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la campagne:', error)
      alert('Erreur de connexion')
    }
  }

  const campaignTypes = [
    { value: 'SEARCH', label: 'Recherche', icon: Search, description: 'Annonces textuelles dans les résultats de recherche' },
    { value: 'SHOPPING', label: 'Shopping', icon: ShoppingCart, description: 'Annonces produit avec images et prix' },
    { value: 'PMAX', label: 'Performance Max', icon: Zap, description: 'Campagne automatisée multi-format' },
    { value: 'DISPLAY', label: 'Display', icon: Target, description: 'Annonces visuelles sur le réseau Display' }
  ]

  const objectives = [
    { value: 'SALES', label: 'Ventes', icon: DollarSign },
    { value: 'LEADS', label: 'Leads', icon: Users },
    { value: 'AWARENESS', label: 'Notoriété', icon: TrendingUp }
  ]

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Créateur de Campagne
          </h2>
          <p className="text-muted-foreground">
            Créez des campagnes Google Ads performantes avec l'assistance IA
          </p>
        </div>
        <Button onClick={generateAISuggestions} disabled={isGenerating}>
          <Brain className="h-4 w-4 mr-2" />
          {isGenerating ? 'Génération...' : 'Suggestions IA'}
        </Button>
      </div>

      {/* Progression */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Étape {currentStep} sur 4</span>
          <span>{Math.round((currentStep / 4) * 100)}%</span>
        </div>
        <Progress value={(currentStep / 4) * 100} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire principal */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="1">Informations</TabsTrigger>
              <TabsTrigger value="2">Ciblage</TabsTrigger>
              <TabsTrigger value="3">Contenu</TabsTrigger>
              <TabsTrigger value="4">Validation</TabsTrigger>
            </TabsList>

            {/* Étape 1: Informations de base */}
            <TabsContent value="1" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de base</CardTitle>
                  <CardDescription>Définissez les paramètres fondamentaux de votre campagne</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom de la campagne</Label>
                    <Input
                      id="name"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Campagne Ventes Q4 2024"
                    />
                  </div>

                  <div>
                    <Label>Objectif principal</Label>
                    <Select value={campaignData.objective} onValueChange={(value: any) => setCampaignData(prev => ({ ...prev, objective: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {objectives.map(obj => (
                          <SelectItem key={obj.value} value={obj.value}>
                            <div className="flex items-center gap-2">
                              <obj.icon className="h-4 w-4" />
                              {obj.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Type de campagne</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {campaignTypes.map(type => (
                        <Card
                          key={type.value}
                          className={`cursor-pointer transition-colors ${
                            campaignData.type === type.value ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setCampaignData(prev => ({ ...prev, type: type.value as any }))}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budget">Budget quotidien (€)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={campaignData.budget}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={campaignData.description}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre campagne, vos objectifs, votre audience cible..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Étape 2: Ciblage */}
            <TabsContent value="2" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ciblage et Audience</CardTitle>
                  <CardDescription>Définissez votre audience cible et vos zones géographiques</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="audience">Audience cible</Label>
                    <Textarea
                      id="audience"
                      value={campaignData.targetAudience}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="Ex: Hommes et femmes, 25-45 ans, intéressés par le fitness, vivant en France..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Langue</Label>
                    <Select value={campaignData.language} onValueChange={(value) => setCampaignData(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">Anglais</SelectItem>
                        <SelectItem value="es">Espagnol</SelectItem>
                        <SelectItem value="de">Allemand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Localisations</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="Ex: Paris, France"
                        onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                      />
                      <Button onClick={addLocation} size="sm">Ajouter</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {campaignData.locations.map(location => (
                        <Badge key={location} variant="secondary" className="cursor-pointer" onClick={() => removeLocation(location)}>
                          {location} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Étape 3: Contenu */}
            <TabsContent value="3" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mots-clés et Contenu</CardTitle>
                  <CardDescription>Ajoutez vos mots-clés cibles pour les campagnes Search</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Mots-clés</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Ex: fitness paris"
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      />
                      <Button onClick={addKeyword} size="sm">Ajouter</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {campaignData.keywords.map(keyword => (
                        <Badge key={keyword} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {campaignData.keywords.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun mot-clé ajouté</p>
                      <p className="text-sm">Ajoutez des mots-clés pour cibler votre audience</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Étape 4: Validation */}
            <TabsContent value="4" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Validation et Création</CardTitle>
                  <CardDescription>Vérifiez vos paramètres avant de créer la campagne</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Nom</div>
                      <div className="text-muted-foreground">{campaignData.name || 'Non défini'}</div>
                    </div>
                    <div>
                      <div className="font-medium">Objectif</div>
                      <div className="text-muted-foreground">{objectives.find(o => o.value === campaignData.objective)?.label}</div>
                    </div>
                    <div>
                      <div className="font-medium">Type</div>
                      <div className="text-muted-foreground">{campaignTypes.find(t => t.value === campaignData.type)?.label}</div>
                    </div>
                    <div>
                      <div className="font-medium">Budget quotidien</div>
                      <div className="text-muted-foreground">{campaignData.budget}€</div>
                    </div>
                    <div>
                      <div className="font-medium">Mots-clés</div>
                      <div className="text-muted-foreground">{campaignData.keywords.length} mots-clés</div>
                    </div>
                    <div>
                      <div className="font-medium">Localisations</div>
                      <div className="text-muted-foreground">{campaignData.locations.length} zones</div>
                    </div>
                  </div>

                  <Button onClick={createCampaign} className="w-full" size="lg">
                    <Target className="h-4 w-4 mr-2" />
                    Créer la Campagne
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Suggestions IA */}
        <div className="space-y-6">
          {aiSuggestions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Suggestions IA
                </CardTitle>
                <CardDescription>Recommandations basées sur vos paramètres</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Budget recommandé</Label>
                  <div className="text-2xl font-bold text-primary">{aiSuggestions.budgetRecommendation}€</div>
                  <p className="text-xs text-muted-foreground">Budget quotidien optimal</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Mots-clés suggérés</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiSuggestions.keywords.slice(0, 6).map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Conseils d'optimisation</Label>
                  <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                    {aiSuggestions.optimizationTips.map((tip, index) => (
                      <li key={index}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Aide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-medium">Campagne Search</div>
                <p className="text-muted-foreground">Idéale pour générer des leads qualifiés avec des mots-clés spécifiques</p>
              </div>
              <div>
                <div className="font-medium">Campagne Shopping</div>
                <p className="text-muted-foreground">Parfaite pour vendre des produits avec des images et prix</p>
              </div>
              <div>
                <div className="font-medium">Performance Max</div>
                <p className="text-muted-foreground">Campagne automatisée optimisant tous les formats Google Ads</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 