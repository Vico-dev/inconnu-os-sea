'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Play, Pause, BarChart3, Plus, Eye, TrendingUp, Users, Target } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ABTest {
  id: string
  name: string
  description: string
  campaignId: string
  campaignName: string
  type: 'CREATIVE' | 'KEYWORD' | 'TARGETING' | 'BIDDING'
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'PAUSED'
  startDate: Date
  endDate: Date
  trafficSplit: number
  variantA: {
    name: string
    description: string
    settings: any
    performance?: any
  }
  variantB: {
    name: string
    description: string
    settings: any
    performance?: any
  }
  results?: {
    winner: 'A' | 'B' | 'TIE' | null
    confidence: number
    improvement: number
    recommendation: string
  }
  clientAccountId: string
  clientName: string
  createdAt: Date
}

export default function ABTestsPage() {
  const [tests, setTests] = useState<ABTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)

  // Formulaire de création
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaignId: '',
    type: 'CREATIVE' as 'CREATIVE' | 'KEYWORD' | 'TARGETING' | 'BIDDING',
    startDate: '',
    endDate: '',
    trafficSplit: 50,
    variantA: {
      name: '',
      description: '',
      settings: {}
    },
    variantB: {
      name: '',
      description: '',
      settings: {}
    }
  })

  useEffect(() => {
    fetchABTests()
  }, [])

  const fetchABTests = async () => {
    try {
      const response = await fetch('/api/admin/ab-tests')
      if (response.ok) {
        const data = await response.json()
        setTests(data.tests || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des tests A/B:', error)
      toast.error('Erreur lors de la récupération des tests A/B')
    } finally {
      setIsLoading(false)
    }
  }

  const createABTest = async () => {
    if (!formData.name || !formData.campaignId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/ab-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate)
        }),
      })

      if (response.ok) {
        toast.success('Test A/B créé avec succès !')
        setShowCreateDialog(false)
        resetForm()
        fetchABTests()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création du test')
      }
    } catch (error) {
      console.error('Erreur lors de la création du test A/B:', error)
      toast.error('Erreur lors de la création du test')
    } finally {
      setIsCreating(false)
    }
  }

  const startABTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/admin/ab-tests/${testId}/start`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Test A/B démarré avec succès !')
        fetchABTests()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du démarrage du test')
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du test:', error)
      toast.error('Erreur lors du démarrage du test')
    }
  }

  const stopABTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/admin/ab-tests/${testId}/stop`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Test A/B arrêté avec succès !')
        fetchABTests()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'arrêt du test')
      }
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du test:', error)
      toast.error('Erreur lors de l\'arrêt du test')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      campaignId: '',
      type: 'CREATIVE',
      startDate: '',
      endDate: '',
      trafficSplit: 50,
      variantA: {
        name: '',
        description: '',
        settings: {}
      },
      variantB: {
        name: '',
        description: '',
        settings: {}
      }
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">Brouillon</Badge>
      case 'RUNNING':
        return <Badge variant="default" className="bg-green-100 text-green-800">En cours</Badge>
      case 'COMPLETED':
        return <Badge variant="outline" className="border-blue-200 text-blue-800">Terminé</Badge>
      case 'PAUSED':
        return <Badge variant="outline" className="border-yellow-200 text-yellow-800">En pause</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CREATIVE':
        return 'Créatifs'
      case 'KEYWORD':
        return 'Mots-clés'
      case 'TARGETING':
        return 'Ciblage'
      case 'BIDDING':
        return 'Enchères'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des tests A/B...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tests A/B</h1>
          <p className="text-gray-600 mt-2">
            Gérez les tests A/B pour optimiser les performances des campagnes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-500">Tests A/B</span>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nouveau test A/B
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau test A/B</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du test *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Test créatifs Q4"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type de test *</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREATIVE">Créatifs</SelectItem>
                        <SelectItem value="KEYWORD">Mots-clés</SelectItem>
                        <SelectItem value="TARGETING">Ciblage</SelectItem>
                        <SelectItem value="BIDDING">Enchères</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du test..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Date de début *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Date de fin *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="trafficSplit">Split de trafic (%)</Label>
                  <Input
                    id="trafficSplit"
                    type="number"
                    min="10"
                    max="90"
                    value={formData.trafficSplit}
                    onChange={(e) => setFormData({ ...formData, trafficSplit: parseInt(e.target.value) })}
                    placeholder="50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Pourcentage de trafic alloué à la variante A (10-90%)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="variantA">Variante A</Label>
                    <Input
                      id="variantA"
                      value={formData.variantA.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        variantA: { ...formData.variantA, name: e.target.value }
                      })}
                      placeholder="Nom de la variante A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="variantB">Variante B</Label>
                    <Input
                      id="variantB"
                      value={formData.variantB.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        variantB: { ...formData.variantB, name: e.target.value }
                      })}
                      placeholder="Nom de la variante B"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createABTest} disabled={isCreating}>
                    {isCreating ? 'Création...' : 'Créer le test'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des tests</p>
                <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.status === 'RUNNING').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tests.filter(t => t.status === 'COMPLETED').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de succès</p>
                <p className="text-2xl font-bold text-purple-600">
                  {tests.filter(t => t.status === 'COMPLETED' && t.results?.winner).length > 0 
                    ? `${Math.round((tests.filter(t => t.status === 'COMPLETED' && t.results?.winner).length / tests.filter(t => t.status === 'COMPLETED').length) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des tests */}
      <Card>
        <CardHeader>
          <CardTitle>Tests A/B</CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun test A/B pour le moment</p>
              <p className="text-sm text-gray-400">Créez votre premier test pour commencer à optimiser</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{test.name}</h3>
                        {getStatusBadge(test.status)}
                        <Badge variant="outline">{getTypeLabel(test.type)}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Client: {test.clientName}</span>
                        <span>Campagne: {test.campaignName}</span>
                        <span>Split: {test.trafficSplit}% / {100 - test.trafficSplit}%</span>
                        <span>Créé le: {new Date(test.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          onClick={() => startABTest(test.id)}
                          className="flex items-center gap-1"
                        >
                          <Play className="w-4 h-4" />
                          Démarrer
                        </Button>
                      )}
                      {test.status === 'RUNNING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => stopABTest(test.id)}
                          className="flex items-center gap-1"
                        >
                          <Pause className="w-4 h-4" />
                          Arrêter
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTest(test)}
                      >
                        <Eye className="w-4 h-4" />
                        Détails
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de détails */}
      {selectedTest && (
        <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Détails du test A/B</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Informations générales</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nom:</strong> {selectedTest.name}</p>
                    <p><strong>Type:</strong> {getTypeLabel(selectedTest.type)}</p>
                    <p><strong>Statut:</strong> {getStatusBadge(selectedTest.status)}</p>
                    <p><strong>Client:</strong> {selectedTest.clientName}</p>
                    <p><strong>Campagne:</strong> {selectedTest.campaignName}</p>
                    <p><strong>Split de trafic:</strong> {selectedTest.trafficSplit}% / {100 - selectedTest.trafficSplit}%</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Variantes</h3>
                  <div className="space-y-3">
                    <div className="border rounded p-3">
                      <p className="font-medium text-blue-600">Variante A: {selectedTest.variantA.name}</p>
                      <p className="text-sm text-gray-600">{selectedTest.variantA.description}</p>
                    </div>
                    <div className="border rounded p-3">
                      <p className="font-medium text-green-600">Variante B: {selectedTest.variantB.name}</p>
                      <p className="text-sm text-gray-600">{selectedTest.variantB.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedTest.results && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Résultats</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p><strong>Gagnant:</strong> {selectedTest.results.winner || 'Aucun'}</p>
                      <p><strong>Confiance:</strong> {(selectedTest.results.confidence * 100).toFixed(1)}%</p>
                      <p><strong>Amélioration:</strong> {selectedTest.results.improvement.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p><strong>Recommandation:</strong></p>
                      <p className="text-sm text-gray-600">{selectedTest.results.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 