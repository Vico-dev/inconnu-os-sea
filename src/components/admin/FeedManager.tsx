"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Database, 
  Brain, 
  RefreshCw, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Download,
  Upload
} from "lucide-react"

interface GMCAccount {
  id: string
  name: string
  website_url: string
  feeds: GMCFeed[]
}

interface GMCFeed {
  id: string
  name: string
  products: GMCProduct[]
  last_updated: string
  status: 'active' | 'inactive' | 'pending'
}

interface GMCProduct {
  id: string
  title: string
  description: string
  price: {
    value: string
    currency: string
  }
  availability: string
  condition: string
  brand: string
  gtin: string
  mpn: string
  custom_labels: {
    custom_label_0?: string
    custom_label_1?: string
    custom_label_2?: string
    custom_label_3?: string
    custom_label_4?: string
  }
  image_link: string
  additional_image_links?: string[]
  product_types: string[]
  google_product_category: string
}

interface OptimizedProduct {
  id: string
  original_title: string
  optimized_title: string
  original_description: string
  optimized_description: string
  score: {
    overall: number
    title: number
    description: number
    price: number
    images: number
    seo: number
    conversion: number
    recommendations: string[]
  }
  custom_labels: {
    custom_label_0: string
    custom_label_1: string
    custom_label_2: string
    custom_label_3: string
    custom_label_4: string
  }
}

interface ScoringStats {
  totalProducts: number
  averageScore: string
  highPerformance: number
  mediumPerformance: number
  lowPerformance: number
  optimizationRate: string
}

interface GoogleAdsAccount {
  id: string
  name: string
  customerId: string
  status: string
  clientName?: string
  clientEmail?: string
}

interface FeedManagerProps {
  selectedAccount?: GoogleAdsAccount
}

export function FeedManager({ selectedAccount: googleAdsAccount }: FeedManagerProps) {
  const [accounts, setAccounts] = useState<GMCAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<GMCAccount | null>(null)
  const [selectedFeed, setSelectedFeed] = useState<GMCFeed | null>(null)
  const [optimizedProducts, setOptimizedProducts] = useState<OptimizedProduct[]>([])
  const [scoringStats, setScoringStats] = useState<ScoringStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<OptimizedProduct | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Charger les comptes GMC
  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/feed-manager/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
        if (data.length > 0) {
          setSelectedAccount(data[0])
        }
      }
    } catch (error) {
      console.error('Erreur chargement comptes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeFeed = async (accountId: string, feedId: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/admin/feed-manager/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, feedId })
      })

      if (response.ok) {
        const data = await response.json()
        setOptimizedProducts(data.optimizedProducts)
        setScoringStats(data.stats)
        
        // Mettre à jour le feed sélectionné avec les nouvelles données
        if (selectedFeed && selectedFeed.id === feedId) {
          setSelectedFeed({
            ...selectedFeed,
            last_updated: new Date().toISOString()
          })
        }
        
        console.log('✅ Feed optimisé:', data.message)
      } else {
        const error = await response.json()
        console.error('Erreur optimisation:', error.error)
      }
    } catch (error) {
      console.error('Erreur analyse feed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateFeed = async (accountId: string, feedId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/feed-manager/feed/${accountId}/${feedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update',
          optimizedProducts 
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Feed mis à jour:', data.message)
      }
    } catch (error) {
      console.error('Erreur mise à jour feed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncFeed = async (accountId: string, feedId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/feed-manager/feed/${accountId}/${feedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Synchronisation terminée:', data.message)
      }
    } catch (error) {
      console.error('Erreur synchronisation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkOptimizationStatus = async (accountId: string, feedId: string) => {
    try {
      const response = await fetch(`/api/admin/feed-manager/optimize?accountId=${accountId}&feedId=${feedId}`)
      
      if (response.ok) {
        const data = await response.json()
        return data.optimizationStatus
      }
    } catch (error) {
      console.error('Erreur vérification statut:', error)
    }
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 6) return <Badge className="bg-yellow-100 text-yellow-800">Bon</Badge>
    return <Badge className="bg-red-100 text-red-800">À améliorer</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Sélection du compte et feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-purple-600" />
            <span>Configuration GMC</span>
          </CardTitle>
          <CardDescription>
            Sélectionnez un compte et un feed à analyser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sélecteur de compte */}
          <div>
            <label className="text-sm font-medium">Compte GMC</label>
            <select 
              className="w-full mt-1 p-2 border rounded-md"
              value={selectedAccount?.id || ''}
              onChange={(e) => {
                const account = accounts.find(a => a.id === e.target.value)
                setSelectedAccount(account || null)
                setSelectedFeed(null)
              }}
            >
              <option value="">Sélectionner un compte</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.website_url})
                </option>
              ))}
            </select>
          </div>

          {/* Sélecteur de feed */}
          {selectedAccount && (
            <div>
              <label className="text-sm font-medium">Feed</label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={selectedFeed?.id || ''}
                onChange={(e) => {
                  const feed = selectedAccount.feeds.find(f => f.id === e.target.value)
                  setSelectedFeed(feed || null)
                }}
              >
                <option value="">Sélectionner un feed</option>
                {selectedAccount.feeds.map(feed => (
                  <option key={feed.id} value={feed.id}>
                    {feed.name} ({feed.products.length} produits)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          {selectedFeed && (
            <div className="flex space-x-2">
              <Button 
                onClick={() => analyzeFeed(selectedAccount!.id, selectedFeed.id)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyser avec IA
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => syncFeed(selectedAccount!.id, selectedFeed.id)}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Synchroniser
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résultats de l'analyse */}
      {scoringStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-green-600" />
              <span>Résultats de l'Analyse IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="products">Produits</TabsTrigger>
                <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{scoringStats.totalProducts}</div>
                      <div className="text-sm text-muted-foreground">Produits analysés</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{scoringStats.averageScore}/10</div>
                      <div className="text-sm text-muted-foreground">Score moyen</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{scoringStats.highPerformance}</div>
                      <div className="text-sm text-muted-foreground">Performance élevée</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{scoringStats.optimizationRate}%</div>
                      <div className="text-sm text-muted-foreground">Taux d'optimisation</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => updateFeed(selectedAccount!.id, selectedFeed!.id)}
                    disabled={isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Mettre à jour GMC
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter Rapport
                  </Button>
                </div>
              </TabsContent>

              {/* Liste des produits */}
              <TabsContent value="products" className="space-y-4">
                <div className="space-y-2">
                  {optimizedProducts.map((product) => (
                    <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium">{product.optimized_title}</h3>
                              {getScoreBadge(product.score.overall)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Score: <span className={getScoreColor(product.score.overall)}>{product.score.overall}/10</span></span>
                              <span>Prix: {product.custom_labels.custom_label_0}</span>
                              <span>Performance: {product.custom_labels.custom_label_1}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowProductDetails(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Recommandations */}
              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-4">
                  {optimizedProducts
                    .filter(p => p.score.recommendations.length > 0)
                    .map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">{product.optimized_title}</h3>
                          <div className="space-y-1">
                            {product.score.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Dialog détails produit */}
      <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du Produit</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div>
                <h3 className="font-semibold mb-2">Informations Générales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Titre Original</label>
                    <p className="text-sm text-muted-foreground">{selectedProduct.original_title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Titre Optimisé</label>
                    <p className="text-sm">{selectedProduct.optimized_title}</p>
                  </div>
                </div>
              </div>

              {/* Scores détaillés */}
              <div>
                <h3 className="font-semibold mb-2">Scores Détaillés</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Score Global</label>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${getScoreColor(selectedProduct.score.overall)}`}>
                        {selectedProduct.score.overall}/10
                      </span>
                      {getScoreBadge(selectedProduct.score.overall)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Titre</label>
                    <span className={`font-bold ${getScoreColor(selectedProduct.score.title)}`}>
                      {selectedProduct.score.title}/10
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <span className={`font-bold ${getScoreColor(selectedProduct.score.description)}`}>
                      {selectedProduct.score.description}/10
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prix</label>
                    <span className={`font-bold ${getScoreColor(selectedProduct.score.price)}`}>
                      {selectedProduct.score.price}/10
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Images</label>
                    <span className={`font-bold ${getScoreColor(selectedProduct.score.images)}`}>
                      {selectedProduct.score.images}/10
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium">SEO</label>
                    <span className={`font-bold ${getScoreColor(selectedProduct.score.seo)}`}>
                      {selectedProduct.score.seo}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom Labels */}
              <div>
                <h3 className="font-semibold mb-2">Custom Labels GMC</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Score Global</label>
                    <p className="text-sm">{selectedProduct.custom_labels.custom_label_0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Performance</label>
                    <p className="text-sm">{selectedProduct.custom_labels.custom_label_1}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Recommandation</label>
                    <p className="text-sm">{selectedProduct.custom_labels.custom_label_2}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date d'optimisation</label>
                    <p className="text-sm">{selectedProduct.custom_labels.custom_label_3}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 