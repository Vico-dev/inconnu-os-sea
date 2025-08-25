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
  testType: 'HEADLINES' | 'DESCRIPTIONS' | 'LANDING_PAGES' | 'BIDDING_STRATEGIES' | 'KEYWORDS'
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
    testType: 'HEADLINES',
    variants: [{ name: 'Contrôle', content: '' }, { name: 'Variante A', content: '' }],
    trafficSplit: 50,
    duration: 14
  })

  // Charger les vrais tests depuis l'API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('/api/admin/ab-tests')
        if (response.ok) {
          const data = await response.json()
          setTests(data.tests || [])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des tests A/B:', error)
      }
    }
    
    fetchTests()
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
          testType: 'HEADLINES',
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
        // Mettre à jour le statut du test
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
        // Mettre à jour le statut du test
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
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'RUNNING': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Brouillon'
      case 'RUNNING': return 'En cours'
      case 'PAUSED': return 'En pause'
      case 'COMPLETED': return 'Terminé'
      default: return status
    }
  }

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case 'HEADLINES': return 'Titres d\'annonces'
      case 'DESCRIPTIONS': return 'Descriptions'
      case 'LANDING_PAGES': return 'Pages de destination'
      case 'BIDDING_STRATEGIES': return 'Stratégies d\'enchères'
      case 'KEYWORDS': return 'Mots-clés'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Tests A/B
          </h2>
          <p className="text-muted-foreground">
            Créez et gérez vos tests A/B pour optimiser vos campagnes
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Test
        </Button>
      </div>

      {/* Tests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun test A/B</h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre premier test A/B pour optimiser vos campagnes
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un test
            </Button>
          </div>
        ) : (
          tests.map((test) => (
            <Card key={test.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <Badge className={getStatusColor(test.status)}>
                    {getStatusLabel(test.status)}
                  </Badge>
                </div>
                <CardDescription>{test.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{getTestTypeLabel(test.testType)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Campagne:</span>
                  <span>{test.campaignName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Variantes:</span>
                  <span>{test.variants.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Répartition:</span>
                  <span>{test.trafficSplit}%</span>
                </div>

                {test.status === 'RUNNING' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Niveau de confiance</span>
                      <span>{test.confidenceLevel}%</span>
                    </div>
                    <Progress value={test.confidenceLevel} className="h-2" />
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  {test.status === 'DRAFT' && (
                    <Button size="sm" onClick={() => handleStartTest(test.id)}>
                      <Play className="h-4 w-4 mr-1" />
                      Démarrer
                    </Button>
                  )}
                  {test.status === 'RUNNING' && (
                    <Button size="sm" variant="outline" onClick={() => handlePauseTest(test.id)}>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedTest(test)
                      setShowResultsDialog(true)
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Résultats
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Test Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau test A/B</DialogTitle>
            <DialogDescription>
              Configurez votre test A/B pour optimiser vos campagnes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du test</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Test headlines campagne Q4"
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

            <div>
              <Label htmlFor="testType">Type de test</Label>
              <Select 
                value={formData.testType} 
                onValueChange={(value: any) => setFormData({ ...formData, testType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEADLINES">Titres d'annonces</SelectItem>
                  <SelectItem value="DESCRIPTIONS">Descriptions</SelectItem>
                  <SelectItem value="LANDING_PAGES">Pages de destination</SelectItem>
                  <SelectItem value="BIDDING_STRATEGIES">Stratégies d'enchères</SelectItem>
                  <SelectItem value="KEYWORDS">Mots-clés</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="duration">Durée du test (jours)</Label>
              <Input
                id="duration"
                type="number"
                min="7"
                max="30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Variantes</Label>
              <div className="space-y-2">
                {formData.variants.map((variant, index) => (
                  <div key={index} className="flex space-x-2">
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

      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Résultats du test A/B</DialogTitle>
            <DialogDescription>
              Analyse détaillée des performances des variantes
            </DialogDescription>
          </DialogHeader>
          
          {selectedTest && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTest.variants.map((variant) => (
                  <Card key={variant.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{variant.name}</span>
                        {selectedTest.winner === variant.id && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Gagnant
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        {variant.content}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Impressions:</span>
                          <p className="font-medium">{variant.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clics:</span>
                          <p className="font-medium">{variant.clicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CTR:</span>
                          <p className="font-medium">{variant.ctr.toFixed(2)}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conversions:</span>
                          <p className="font-medium">{variant.conversions}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Taux de conversion:</span>
                          <p className="font-medium">{variant.conversionRate.toFixed(2)}%</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ROAS:</span>
                          <p className="font-medium">{variant.roas.toFixed(2)}x</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 