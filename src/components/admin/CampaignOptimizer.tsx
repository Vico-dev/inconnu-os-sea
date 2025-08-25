'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Settings,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Edit3,
  Trash2
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: 'SEARCH' | 'SHOPPING' | 'PMAX' | 'DISPLAY'
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpa: number
  roas: number
  score: number
  lastOptimized: string
}

interface OptimizationRecommendation {
  id: string
  type: 'BUDGET' | 'BID' | 'KEYWORD' | 'TARGETING' | 'CREATIVE'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  estimatedImprovement: number
  action: string
  applied: boolean
}

interface PerformanceMetrics {
  totalSpent: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  averageCtr: number
  averageCpc: number
  averageCpa: number
  averageRoas: number
  optimizationScore: number
}

interface GoogleAdsAccount {
  id: string
  name: string
  customerId: string
  status: string
  clientName?: string
  clientEmail?: string
}

interface CampaignOptimizerProps {
  selectedAccount?: GoogleAdsAccount
}

export function CampaignOptimizer({ selectedAccount }: CampaignOptimizerProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadCampaigns()
    loadRecommendations()
    loadMetrics()
  }, [])

  const loadCampaigns = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/campaign-optimizer/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/admin/campaign-optimizer/recommendations')
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error)
    }
  }

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/admin/campaign-optimizer/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error)
    }
  }

  const applyOptimization = async (recommendationId: string) => {
    setIsOptimizing(true)
    try {
      const response = await fetch('/api/admin/campaign-optimizer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId })
      })
      
      if (response.ok) {
        // Recharger les données
        await loadCampaigns()
        await loadRecommendations()
        await loadMetrics()
      }
    } catch (error) {
      console.error('Erreur lors de l\'application de l\'optimisation:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'POSITIVE': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'NEGATIVE': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'NEUTRAL': return <BarChart3 className="h-4 w-4 text-gray-600" />
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Optimiseur de Campagnes
          </h2>
          <p className="text-muted-foreground">
            Optimisez vos campagnes Google Ads avec l'IA et des recommandations avancées
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadCampaigns} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={loadRecommendations} disabled={isOptimizing}>
            <Brain className="h-4 w-4 mr-2" />
            Analyser
          </Button>
        </div>
      </div>

      {/* Métriques globales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dépensé Total</p>
                  <p className="text-2xl font-bold">{metrics.totalSpent.toFixed(2)}€</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROAS Moyen</p>
                  <p className="text-2xl font-bold">{metrics.averageRoas.toFixed(2)}x</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CPA Moyen</p>
                  <p className="text-2xl font-bold">{metrics.averageCpa.toFixed(2)}€</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Score Optimisation</p>
                  <p className="text-2xl font-bold">{metrics.optimizationScore}/100</p>
                </div>
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des campagnes */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Campagnes</CardTitle>
              <CardDescription>
                {campaigns.length} campagne{campaigns.length > 1 ? 's' : ''} active{campaigns.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 mx-auto animate-spin" />
                  <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune campagne trouvée</p>
                  <p className="text-sm">Créez des campagnes pour commencer l'optimisation</p>
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className={`cursor-pointer transition-colors ${
                      selectedCampaign?.id === campaign.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium truncate">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Budget:</span>
                          <span>{campaign.budget}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ROAS:</span>
                          <span className={campaign.roas > 2 ? 'text-green-600' : 'text-red-600'}>
                            {campaign.roas.toFixed(2)}x
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Score:</span>
                          <span className={campaign.score > 70 ? 'text-green-600' : campaign.score > 40 ? 'text-yellow-600' : 'text-red-600'}>
                            {campaign.score}/100
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Détails et optimisations */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-4">
              {selectedCampaign ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedCampaign.name}</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="outline">
                          {selectedCampaign.status === 'ACTIVE' ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activer
                            </>
                          )}
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Métriques principales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedCampaign.impressions.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedCampaign.clicks.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Clics</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedCampaign.conversions}</p>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedCampaign.spent.toFixed(2)}€</p>
                        <p className="text-sm text-muted-foreground">Dépensé</p>
                      </div>
                    </div>

                    {/* Indicateurs de performance */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{selectedCampaign.ctr.toFixed(2)}%</p>
                        <p className="text-sm text-muted-foreground">CTR</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{selectedCampaign.cpc.toFixed(2)}€</p>
                        <p className="text-sm text-muted-foreground">CPC</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{selectedCampaign.cpa.toFixed(2)}€</p>
                        <p className="text-sm text-muted-foreground">CPA</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{selectedCampaign.roas.toFixed(2)}x</p>
                        <p className="text-sm text-muted-foreground">ROAS</p>
                      </div>
                    </div>

                    {/* Score d'optimisation */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Score d'optimisation</Label>
                        <span className="text-sm font-medium">{selectedCampaign.score}/100</span>
                      </div>
                      <Progress value={selectedCampaign.score} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Dernière optimisation: {new Date(selectedCampaign.lastOptimized).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez une campagne pour voir les détails</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Recommandations */}
            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Recommandations IA
                  </CardTitle>
                  <CardDescription>
                    Optimisations suggérées par l'intelligence artificielle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune recommandation disponible</p>
                      <p className="text-sm">Cliquez sur "Analyser" pour générer des recommandations</p>
                    </div>
                  ) : (
                    recommendations.map((recommendation) => (
                      <Card key={recommendation.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getImpactIcon(recommendation.impact)}
                                <h3 className="font-medium">{recommendation.title}</h3>
                                <Badge className={getPriorityColor(recommendation.priority)}>
                                  {recommendation.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {recommendation.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-600">
                                  +{recommendation.estimatedImprovement}% d'amélioration estimée
                                </span>
                                <span className="text-muted-foreground">
                                  Action: {recommendation.action}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {recommendation.applied ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Appliquée
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => applyOptimization(recommendation.id)}
                                  disabled={isOptimizing}
                                >
                                  <Zap className="h-3 w-3 mr-1" />
                                  Appliquer
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analyse de Performance
                  </CardTitle>
                  <CardDescription>
                    Graphiques et tendances de performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Graphiques de performance</p>
                    <p className="text-sm">Les graphiques seront affichés ici</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 