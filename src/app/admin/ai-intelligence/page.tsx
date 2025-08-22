"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Brain, TrendingUp, Target, AlertTriangle, BarChart3, Lightbulb, 
  Zap, Settings, Eye, Play, Pause, RefreshCw, CheckCircle, XCircle,
  Clock, DollarSign, Users, Activity, ArrowUp, ArrowDown, Star
} from "lucide-react"
import { AIRecommendation, BenchmarkData, AlertRule } from "@/lib/ai-recommendations-service"

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  budget: number
  client: {
    name: string
  }
}

export default function AIIntelligencePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("recommendations")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null)
  const [alerts, setAlerts] = useState<AlertRule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [showBenchmarkDialog, setShowBenchmarkDialog] = useState(false)

  // Charger les vraies campagnes depuis l'API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch('/api/admin/campaigns')
        if (response.ok) {
          const data = await response.json()
          setCampaigns(data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des campagnes:', error)
      }
    }
    
    fetchCampaigns()
  }, [])

  // Charger les recommandations depuis l'API quand une campagne est sélectionnée
  useEffect(() => {
    if (selectedCampaign) {
      generateRecommendations(selectedCampaign.id)
    }
  }, [selectedCampaign])

  // Charger le benchmark depuis l'API
  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        const response = await fetch('/api/admin/ai-recommendations?industry=E-commerce&campaignType=SEARCH')
        if (response.ok) {
          const data = await response.json()
          setBenchmark(data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement du benchmark:', error)
      }
    }
    
    fetchBenchmark()
  }, [])

  // Charger les alertes depuis l'API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/admin/alerts')
        if (response.ok) {
          const data = await response.json()
          setAlerts(data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error)
        setAlerts([])
      }
    }
    
    fetchAlerts()
  }, [])

  const generateRecommendations = async (campaignId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/ai-recommendations?campaignId=${campaignId}`)
      const data = await response.json()
      setRecommendations(data)
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error)
    } finally {
      setIsLoading(false)
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'KEYWORD': return <Target className="w-4 h-4" />
      case 'BUDGET': return <DollarSign className="w-4 h-4" />
      case 'CREATIVE': return <Lightbulb className="w-4 h-4" />
      case 'TARGETING': return <Users className="w-4 h-4" />
      case 'OPTIMIZATION': return <Zap className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HARD': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "ACCOUNT_MANAGER"]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="w-8 h-8 text-blue-600" />
              Intelligence Avancée
            </h1>
            <p className="text-muted-foreground">
              Recommandations IA, benchmarking et alertes intelligentes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBenchmarkDialog(true)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Nouveau Benchmark
            </Button>
            <Button
              onClick={() => setShowAlertDialog(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Nouvelle Alerte
            </Button>
          </div>
        </div>

        {/* Sélection de campagne */}
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner une campagne</CardTitle>
            <CardDescription>
              Choisissez une campagne pour générer des recommandations IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCampaign?.id === campaign.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <Badge variant="outline">{campaign.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {campaign.client.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {campaign.budget.toLocaleString()}€
                      </span>
                      <Badge 
                        variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Recommandations IA</TabsTrigger>
            <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
            <TabsTrigger value="alerts">Alertes Intelligentes</TabsTrigger>
          </TabsList>

          {/* Recommandations IA */}
          <TabsContent value="recommendations" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Recommandations Automatiques</h2>
                <p className="text-muted-foreground">
                  Suggestions d'optimisation générées par l'IA
                </p>
              </div>
              {selectedCampaign && (
                <Button
                  onClick={() => generateRecommendations(selectedCampaign.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  Générer de nouvelles recommandations
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {recommendations.map((recommendation) => (
                <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(recommendation.type)}
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {recommendation.title}
                            <Badge className={getPriorityColor(recommendation.priority)}>
                              {recommendation.priority}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {recommendation.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          +{recommendation.impact.expectedImprovement}{recommendation.impact.unit}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Impact attendu sur {recommendation.impact.metric}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Métriques */}
                      <div>
                        <h4 className="font-semibold mb-3">Métriques</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Confiance IA:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={recommendation.confidence} className="w-20" />
                              <span className="text-sm font-medium">{recommendation.confidence}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Difficulté:</span>
                            <Badge className={getDifficultyColor(recommendation.implementation.difficulty)}>
                              {recommendation.implementation.difficulty}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Temps estimé:</span>
                            <span className="text-sm font-medium">{recommendation.implementation.estimatedTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Étapes d'implémentation */}
                      <div>
                        <h4 className="font-semibold mb-3">Étapes d'implémentation</h4>
                        <ol className="space-y-2">
                          {recommendation.implementation.steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-2">
                        {recommendation.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Benchmarking */}
          <TabsContent value="benchmarking" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Benchmarking Sectoriel</h2>
              <p className="text-muted-foreground">
                Comparaison avec les moyennes du secteur
              </p>
            </div>

            {benchmark && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Métriques du benchmark */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Métriques du secteur {benchmark.industry}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>CTR moyen</span>
                        <span className="font-semibold">{benchmark.metrics.ctr}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>CPC moyen</span>
                        <span className="font-semibold">{benchmark.metrics.cpc}€</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Taux de conversion</span>
                        <span className="font-semibold">{benchmark.metrics.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>ROAS moyen</span>
                        <span className="font-semibold">{benchmark.metrics.roas}x</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Position vs concurrence */}
                <Card>
                  <CardHeader>
                    <CardTitle>Position vs Concurrence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold text-blue-600">
                        {benchmark.percentile}%
                      </div>
                      <p className="text-muted-foreground">
                        Vous êtes dans le top {100 - benchmark.percentile}% du secteur
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${benchmark.percentile}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recommandations du benchmark */}
            {benchmark && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommandations basées sur le benchmark</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {benchmark.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Alertes Intelligentes */}
          <TabsContent value="alerts" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Alertes Intelligentes</h2>
              <p className="text-muted-foreground">
                Règles de notification proactives
              </p>
            </div>

            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                          <CardTitle>{alert.name}</CardTitle>
                          <CardDescription>
                            {alert.condition.metric} {alert.condition.operator} {alert.condition.threshold} 
                            (sur {alert.condition.timeframe})
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.enabled ? "default" : "secondary"}>
                          {alert.enabled ? "Actif" : "Inactif"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Action:</span>
                        <Badge variant="outline" className="ml-2">
                          {alert.action}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          {alert.recipients.length} destinataire(s)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog pour nouvelle alerte */}
        <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle alerte</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="alertName">Nom de l'alerte</Label>
                <Input id="alertName" placeholder="Ex: CTR faible" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metric">Métrique</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ctr">CTR</SelectItem>
                      <SelectItem value="cpc">CPC</SelectItem>
                      <SelectItem value="conversion_rate">Taux de conversion</SelectItem>
                      <SelectItem value="roas">ROAS</SelectItem>
                      <SelectItem value="spend">Dépenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="operator">Opérateur</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gt">Supérieur à</SelectItem>
                      <SelectItem value="lt">Inférieur à</SelectItem>
                      <SelectItem value="eq">Égal à</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="threshold">Seuil</Label>
                  <Input id="threshold" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="timeframe">Période</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 heure</SelectItem>
                      <SelectItem value="24h">24 heures</SelectItem>
                      <SelectItem value="7d">7 jours</SelectItem>
                      <SelectItem value="30d">30 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="action">Action</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="SLACK">Slack</SelectItem>
                    <SelectItem value="DASHBOARD">Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
                  Annuler
                </Button>
                <Button>Créer l'alerte</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog pour nouveau benchmark */}
        <Dialog open={showBenchmarkDialog} onOpenChange={setShowBenchmarkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer un nouveau benchmark</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="industry">Secteur d'activité</Label>
                <Input id="industry" placeholder="Ex: E-commerce, B2B, SaaS" />
              </div>
              <div>
                <Label htmlFor="campaignType">Type de campagne</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEARCH">Search</SelectItem>
                    <SelectItem value="SHOPPING">Shopping</SelectItem>
                    <SelectItem value="DISPLAY">Display</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="PMAX">Performance Max</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowBenchmarkDialog(false)}>
                  Annuler
                </Button>
                <Button>Générer le benchmark</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
} 