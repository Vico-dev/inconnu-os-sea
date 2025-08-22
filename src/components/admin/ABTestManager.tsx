"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Play, 
  Pause, 
  BarChart3, 
  Target, 
  Users, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Settings
} from 'lucide-react'

interface ABTest {
  id: string
  name: string
  description: string
  campaignId: string
  campaignName: string
  testType: 'HEADLINES' | 'DESCRIPTIONS' | 'LANDING_PAGES' | 'BIDDING_STRATEGIES' | 'KEYWORDS'
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  startDate: Date
  endDate?: Date
  variants: {
    id: string
    name: string
    content: string
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    conversionRate: number
    cpc: number
    roas: number
  }[]
  trafficSplit: number // Pourcentage de trafic alloué au test
  confidenceLevel: number
  winner?: string
  createdAt: Date
}

interface ABTestForm {
  name: string
  description: string
  campaignId: string
  testType: string
  variants: { name: string; content: string }[]
  trafficSplit: number
  duration: number // en jours
}

export default function ABTestManager() {
  const [tests, setTests] = useState<ABTest[]>([])
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showResultsDialog, setShowResultsDialog] = useState(false)
  const [formData, setFormData] = useState<ABTestForm>({
    name: '',
    description: '',
    campaignId: '',
    testType: '',
    variants: [{ name: 'Contrôle', content: '' }, { name: 'Variante A', content: '' }],
    trafficSplit: 50,
    duration: 14
  })

  // Mock data
  useEffect(() => {
    setTests([
      {
        id: '1',
        name: 'Test Headlines - Campagne E-commerce',
        description: 'Test de différents headlines pour améliorer le CTR',
        campaignId: 'camp_1',
        campaignName: 'Campagne E-commerce Q4',
        testType: 'HEADLINES',
        status: 'RUNNING',
        startDate: new Date('2024-01-15'),
        variants: [
          {
            id: 'v1',
            name: 'Contrôle',
            content: 'Livraison gratuite - Commandez maintenant',
            impressions: 15000,
            clicks: 450,
            conversions: 27,
            ctr: 3.0,
            conversionRate: 6.0,
            cpc: 2.5,
            roas: 3.2
          },
          {
            id: 'v2',
            name: 'Variante A',
            content: 'Économisez 20% - Offre limitée',
            impressions: 14800,
            clicks: 520,
            conversions: 35,
            ctr: 3.5,
            conversionRate: 6.7,
            cpc: 2.3,
            roas: 3.8
          }
        ],
        trafficSplit: 50,
        confidenceLevel: 85,
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Test Descriptions - Lead Gen',
        description: 'Optimisation des descriptions d\'annonces',
        campaignId: 'camp_2',
        campaignName: 'Génération Leads B2B',
        testType: 'DESCRIPTIONS',
        status: 'COMPLETED',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        variants: [
          {
            id: 'v3',
            name: 'Contrôle',
            content: 'Solution complète pour votre entreprise',
            impressions: 12000,
            clicks: 360,
            conversions: 18,
            ctr: 3.0,
            conversionRate: 5.0,
            cpc: 3.2,
            roas: 2.8
          },
          {
            id: 'v4',
            name: 'Variante A',
            content: 'Découvrez notre solution innovante',
            impressions: 11800,
            clicks: 420,
            conversions: 25,
            ctr: 3.6,
            conversionRate: 6.0,
            cpc: 2.9,
            roas: 3.5
          }
        ],
        trafficSplit: 50,
        confidenceLevel: 95,
        winner: 'v4',
        createdAt: new Date('2024-01-01')
      }
    ])
  }, [])

  const handleCreateTest = async () => {
    try {
      const response = await fetch('/api/admin/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newTest = await response.json()
        setTests([...tests, newTest])
        setShowCreateDialog(false)
        setFormData({
          name: '',
          description: '',
          campaignId: '',
          testType: '',
          variants: [{ name: 'Contrôle', content: '' }, { name: 'Variante A', content: '' }],
          trafficSplit: 50,
          duration: 14
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création du test:', error)
    }
  }

  const handleStartTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/admin/ab-tests/${testId}/start`, {
        method: 'POST'
      })

      if (response.ok) {
        setTests(tests.map(test => 
          test.id === testId ? { ...test, status: 'RUNNING' } : test
        ))
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du test:', error)
    }
  }

  const handlePauseTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/admin/ab-tests/${testId}/pause`, {
        method: 'POST'
      })

      if (response.ok) {
        setTests(tests.map(test => 
          test.id === testId ? { ...test, status: 'PAUSED' } : test
        ))
      }
    } catch (error) {
      console.error('Erreur lors de la pause du test:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'HEADLINES': return <Target className="w-4 h-4" />
      case 'DESCRIPTIONS': return <BarChart3 className="w-4 h-4" />
      case 'LANDING_PAGES': return <Users className="w-4 h-4" />
      case 'BIDDING_STRATEGIES': return <TrendingUp className="w-4 h-4" />
      case 'KEYWORDS': return <Settings className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const calculateStatisticalSignificance = (variant1: any, variant2: any) => {
    // Calcul simplifié de la signification statistique
    const n1 = variant1.impressions
    const n2 = variant2.impressions
    const p1 = variant1.ctr / 100
    const p2 = variant2.ctr / 100
    
    const pooledP = (p1 * n1 + p2 * n2) / (n1 + n2)
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2))
    const z = Math.abs(p1 - p2) / se
    
    // Approximation de la p-value
    return Math.min(100, Math.max(0, 100 - (z * 10)))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tests A/B</h1>
          <p className="text-muted-foreground">
            Créez et gérez des tests A/B pour optimiser vos campagnes
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Test A/B
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau test A/B</DialogTitle>
              <DialogDescription>
                Configurez votre test A/B pour optimiser vos campagnes Google Ads
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du test</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Test Headlines - Campagne E-commerce"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez l'objectif de ce test"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign">Campagne</Label>
                  <Select value={formData.campaignId} onValueChange={(value) => setFormData({ ...formData, campaignId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une campagne" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="camp_1">Campagne E-commerce Q4</SelectItem>
                      <SelectItem value="camp_2">Génération Leads B2B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="testType">Type de test</Label>
                  <Select value={formData.testType} onValueChange={(value) => setFormData({ ...formData, testType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HEADLINES">Headlines</SelectItem>
                      <SelectItem value="DESCRIPTIONS">Descriptions</SelectItem>
                      <SelectItem value="LANDING_PAGES">Pages de destination</SelectItem>
                      <SelectItem value="BIDDING_STRATEGIES">Stratégies d'enchères</SelectItem>
                      <SelectItem value="KEYWORDS">Mots-clés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trafficSplit">Répartition du trafic (%)</Label>
                  <Input
                    id="trafficSplit"
                    type="number"
                    min="10"
                    max="90"
                    value={formData.trafficSplit}
                    onChange={(e) => setFormData({ ...formData, trafficSplit: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Durée (jours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="7"
                    max="90"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div>
                <Label>Variantes</Label>
                <div className="space-y-2">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Nom de la variante"
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...formData.variants]
                          newVariants[index].name = e.target.value
                          setFormData({ ...formData, variants: newVariants })
                        }}
                      />
                      <Input
                        placeholder="Contenu"
                        value={variant.content}
                        onChange={(e) => {
                          const newVariants = [...formData.variants]
                          newVariants[index].content = e.target.value
                          setFormData({ ...formData, variants: newVariants })
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({
                      ...formData,
                      variants: [...formData.variants, { name: `Variante ${formData.variants.length}`, content: '' }]
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une variante
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateTest}>
                Créer le test
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tests List */}
      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  {getTestTypeIcon(test.testType)}
                  <div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(test.status)}>
                    {test.status === 'RUNNING' && <Play className="w-3 h-3 mr-1" />}
                    {test.status === 'PAUSED' && <Pause className="w-3 h-3 mr-1" />}
                    {test.status === 'COMPLETED' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {test.status}
                  </Badge>
                  {test.winner && <Badge className="bg-green-100 text-green-800">Gagnant identifié</Badge>}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Campagne</p>
                  <p className="font-medium">{test.campaignName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Répartition trafic</p>
                  <p className="font-medium">{test.trafficSplit}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confiance statistique</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={test.confidenceLevel} className="flex-1" />
                    <span className="text-sm font-medium">{test.confidenceLevel}%</span>
                  </div>
                </div>
              </div>
              
              {/* Variants Performance */}
              <div className="space-y-2">
                <h4 className="font-medium">Performance des variantes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {test.variants.map((variant) => (
                    <div key={variant.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{variant.name}</h5>
                        {test.winner === variant.id && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Gagnant
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{variant.content}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">CTR:</span>
                          <span className="font-medium ml-1">{variant.ctr}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CPC:</span>
                          <span className="font-medium ml-1">{variant.cpc}€</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conv.:</span>
                          <span className="font-medium ml-1">{variant.conversionRate}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ROAS:</span>
                          <span className="font-medium ml-1">{variant.roas}x</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTest(test)
                    setShowResultsDialog(true)
                  }}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Voir détails
                </Button>
                
                {test.status === 'DRAFT' && (
                  <Button size="sm" onClick={() => handleStartTest(test.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    Démarrer
                  </Button>
                )}
                
                {test.status === 'RUNNING' && (
                  <Button variant="outline" size="sm" onClick={() => handlePauseTest(test.id)}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Résultats détaillés - {selectedTest?.name}</DialogTitle>
            <DialogDescription>
              Analyse complète des performances des variantes
            </DialogDescription>
          </DialogHeader>
          
          {selectedTest && (
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="statistics">Statistiques</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Durée</p>
                      <p className="text-2xl font-bold">
                        {Math.ceil((new Date().getTime() - selectedTest.startDate.getTime()) / (1000 * 60 * 60 * 24))} jours
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Impressions totales</p>
                      <p className="text-2xl font-bold">
                        {selectedTest.variants.reduce((sum, v) => sum + v.impressions, 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Clics totaux</p>
                      <p className="text-2xl font-bold">
                        {selectedTest.variants.reduce((sum, v) => sum + v.clicks, 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Conversions totales</p>
                      <p className="text-2xl font-bold">
                        {selectedTest.variants.reduce((sum, v) => sum + v.conversions, 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Comparaison des variantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTest.variants.map((variant, index) => (
                        <div key={variant.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{variant.name}</h4>
                            {selectedTest.winner === variant.id && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Gagnant
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{variant.content}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Impressions</p>
                              <p className="font-medium">{variant.impressions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Clics</p>
                              <p className="font-medium">{variant.clicks.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">CTR</p>
                              <p className="font-medium">{variant.ctr}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">CPC</p>
                              <p className="font-medium">{variant.cpc}€</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Conversions</p>
                              <p className="font-medium">{variant.conversions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Taux de conversion</p>
                              <p className="font-medium">{variant.conversionRate}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">ROAS</p>
                              <p className="font-medium">{variant.roas}x</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Coût par conversion</p>
                              <p className="font-medium">
                                {variant.conversions > 0 ? (variant.cpc * variant.clicks / variant.conversions).toFixed(2) : 0}€
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="statistics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analyse statistique</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Signification statistique</h4>
                        <div className="flex items-center space-x-2">
                          <Progress value={selectedTest.confidenceLevel} className="flex-1" />
                          <span className="text-sm font-medium">{selectedTest.confidenceLevel}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedTest.confidenceLevel >= 95 ? 
                            'Différence statistiquement significative détectée' :
                            'Différence non statistiquement significative'
                          }
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Recommandations</h4>
                        <ul className="space-y-2 text-sm">
                          {selectedTest.confidenceLevel >= 95 ? (
                            <>
                              <li className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                Le test peut être arrêté, un gagnant a été identifié
                              </li>
                              <li className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                Appliquer la variante gagnante à 100% du trafic
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-center">
                                <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                                Continuer le test pour obtenir plus de données
                              </li>
                              <li className="flex items-center">
                                <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                                Attendre au moins 7 jours supplémentaires
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline du test</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Test créé</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedTest.createdAt.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Test démarré</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedTest.startDate.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      {selectedTest.endDate && (
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Test terminé</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedTest.endDate.toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 