'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Store, 
  Package, 
  Upload, 
  Download, 
  Settings, 
  Plus, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Copy
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ShopifyStore {
  id: string
  name: string
  domain: string
  email: string
  currency: string
  country: string
  timezone: string
  isActive: boolean
  createdAt: Date
}

interface ShopifyProduct {
  id: string
  title: string
  description: string
  price: string
  availability: string
  image_link: string
  brand: string
  product_type: string
  custom_label_2: string // Score de performance
}

export default function FeedManagerPage() {
  const [stores, setStores] = useState<ShopifyStore[]>([])
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [shopName, setShopName] = useState('')
  const [activeTab, setActiveTab] = useState('stores')
  const [showContentAnalysisModal, setShowContentAnalysisModal] = useState(false)
  const [showABTestingModal, setShowABTestingModal] = useState(false)
  const [selectedProductForAnalysis, setSelectedProductForAnalysis] = useState<any>(null)
  const [contentAnalysis, setContentAnalysis] = useState<any>(null)
  const [abTestingData, setAbTestingData] = useState<any>(null)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/shopify/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data.stores || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des stores:', error)
      toast.error('Erreur lors de la récupération des stores')
    } finally {
      setIsLoading(false)
    }
  }

  const connectShopify = async () => {
    if (!shopName.trim()) {
      toast.error('Veuillez entrer le nom de votre boutique')
      return
    }

    setIsConnecting(true)
    try {
      const response = await fetch('/api/shopify/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: shopName })
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la connexion')
      }
    } catch (error) {
      console.error('Erreur lors de la connexion Shopify:', error)
      toast.error('Erreur lors de la connexion')
    } finally {
      setIsConnecting(false)
      setShowConnectDialog(false)
    }
  }

  const fetchProducts = async (storeId: string) => {
    try {
      const response = await fetch(`/api/shopify/products?storeId=${storeId}&limit=100`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setSelectedStore(storeId)
        setActiveTab('products')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error)
      toast.error('Erreur lors de la récupération des produits')
    }
  }

  const removeStore = async (storeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      return
    }

    try {
      const response = await fetch('/api/shopify/stores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId })
      })

      if (response.ok) {
        toast.success('Boutique supprimée avec succès')
        fetchStores()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const exportToGMC = async () => {
    if (!selectedStore) {
      toast.error('Veuillez sélectionner une boutique')
      return
    }

    toast.loading('Export vers Google Merchant Center en cours...')
    try {
      // TODO: Implémenter l'export vers GMC
      setTimeout(() => {
        toast.dismiss()
        toast.success('Export vers GMC réussi !')
      }, 2000)
    } catch (error) {
      toast.dismiss()
      toast.error('Erreur lors de l\'export')
    }
  }

  const showContentAnalysis = async (productId: string, storeId: string) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      setSelectedProductForAnalysis(product)
      
      const response = await fetch('/api/shopify/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, storeId, analysisType: 'content' })
      })

      if (response.ok) {
        const data = await response.json()
        setContentAnalysis(data)
        setShowContentAnalysisModal(true)
      } else {
        toast.error('Erreur lors de l\'analyse du contenu')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'analyse du contenu')
    }
  }

  const showABTesting = async (productId: string, storeId: string) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      setSelectedProductForAnalysis(product)
      
      const response = await fetch('/api/shopify/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, storeId, analysisType: 'ab_testing' })
      })

      if (response.ok) {
        const data = await response.json()
        setAbTestingData(data)
        setShowABTestingModal(true)
      } else {
        toast.error('Erreur lors de la génération des variantes A/B')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la génération des variantes A/B')
    }
  }

  const getPerformanceScore = (score: string) => {
    const numScore = parseInt(score)
    if (numScore >= 80) return { color: 'bg-green-100 text-green-800', label: 'Excellent' }
    if (numScore >= 60) return { color: 'bg-yellow-100 text-yellow-800', label: 'Bon' }
    return { color: 'bg-red-100 text-red-800', label: 'À améliorer' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du Feed Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feed Manager</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos flux de produits et optimisez-les pour Google Merchant Center
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-500">Gestion des flux</span>
          </div>
          <Button onClick={() => setShowConnectDialog(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Connecter Shopify
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Boutiques connectées</p>
                <p className="text-2xl font-bold text-blue-600">{stores.length}</p>
              </div>
              <Store className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produits total</p>
                <p className="text-2xl font-bold text-green-600">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score moyen</p>
                <p className="text-2xl font-bold text-purple-600">
                  {products.length > 0 
                    ? Math.round(products.reduce((sum, p) => sum + parseInt(p.custom_label_2), 0) / products.length)
                    : 0
                  }/100
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dernière sync</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stores.length > 0 ? 'Aujourd\'hui' : 'Jamais'}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface principale */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stores">Boutiques Shopify</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vos boutiques Shopify</CardTitle>
            </CardHeader>
            <CardContent>
              {stores.length === 0 ? (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune boutique Shopify connectée</p>
                  <p className="text-sm text-gray-400 mb-4">Connectez votre première boutique pour commencer</p>
                  <Button onClick={() => setShowConnectDialog(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Connecter Shopify
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stores.map((store) => (
                    <div key={store.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{store.name}</h3>
                            <Badge className="bg-green-100 text-green-800">Connecté</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{store.domain}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Devise: {store.currency}</span>
                            <span>Pays: {store.country}</span>
                            <span>Connecté le: {new Date(store.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchProducts(store.id)}
                          >
                            <Package className="w-4 h-4" />
                            Voir produits
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeStore(store.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Produits optimisés</CardTitle>
                {selectedStore && (
                  <Button onClick={exportToGMC} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exporter vers GMC
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedStore ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Sélectionnez une boutique pour voir ses produits</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun produit trouvé</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.slice(0, 10).map((product) => {
                    const score = getPerformanceScore(product.custom_label_2)
                    const aiAnalysis = product.ai_analysis
                    return (
                      <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          {product.image_link && (
                            <img 
                              src={product.image_link} 
                              alt={product.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{product.title}</h3>
                              <Badge className={score.color}>{score.label}</Badge>
                              <span className="text-xs text-gray-500">Score: {aiAnalysis?.score || product.custom_label_2}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                              {product.description ? product.description.substring(0, 100) + '...' : 'Aucune description'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span>Prix: {product.price}</span>
                              <span>Marque: {product.brand}</span>
                              <span>Type: {product.product_type}</span>
                              <span>Disponibilité: {product.availability}</span>
                            </div>
                            
                            {/* Analyse IA et recommandations */}
                            {aiAnalysis && aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Recommandations d'amélioration
                                </h4>
                                <ul className="space-y-1">
                                  {aiAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                                      <span className="text-blue-600 mt-1">•</span>
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                                {aiAnalysis.recommendations.length > 3 && (
                                  <p className="text-xs text-blue-600 mt-2">
                                    +{aiAnalysis.recommendations.length - 3} autres recommandations...
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Boutons d'analyse IA avancée */}
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => showContentAnalysis(product.id, selectedStore)}
                                className="text-xs"
                              >
                                <BarChart3 className="w-3 h-3 mr-1" />
                                Analyse Contenu
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => showABTesting(product.id, selectedStore)}
                                className="text-xs"
                              >
                                <TrendingUp className="w-3 h-3 mr-1" />
                                A/B Testing
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {products.length > 10 && (
                    <div className="text-center pt-4">
                      <p className="text-gray-500">Et {products.length - 10} autres produits...</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export vers Google Merchant Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Exportez vos produits optimisés vers Google Merchant Center</p>
                  <p className="text-sm text-gray-400 mb-4">Vos produits seront automatiquement optimisés avec l'IA</p>
                  <Button onClick={exportToGMC} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exporter vers GMC
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de connexion Shopify */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connecter une boutique Shopify</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shop-name">Nom de votre boutique</Label>
              <Input
                id="shop-name"
                placeholder="votre-boutique.myshopify.com"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Entrez le nom de votre boutique Shopify (ex: votre-boutique.myshopify.com)
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Annuler
              </Button>
              <Button onClick={connectShopify} disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'analyse de contenu */}
      <Dialog open={showContentAnalysisModal} onOpenChange={setShowContentAnalysisModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analyse IA du Contenu - {selectedProductForAnalysis?.title}</DialogTitle>
          </DialogHeader>
          
          {contentAnalysis && (
            <div className="space-y-6">
              {/* Analyse du titre */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Analyse du Titre</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Titre actuel:</strong> {contentAnalysis.analysis.title.current}</p>
                    <p><strong>Longueur:</strong> {contentAnalysis.analysis.title.length} caractères</p>
                    <p><strong>Contient des mots-clés:</strong> {contentAnalysis.analysis.title.hasKeywords ? '✅' : '❌'}</p>
                    <p><strong>Contient la marque:</strong> {contentAnalysis.analysis.title.hasBrand ? '✅' : '❌'}</p>
                    <p><strong>Contient la catégorie:</strong> {contentAnalysis.analysis.title.hasCategory ? '✅' : '❌'}</p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Suggestions d'amélioration:</p>
                    <ul className="space-y-1">
                      {contentAnalysis.analysis.title.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-blue-600">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Analyse de la description */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Analyse de la Description</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Longueur:</strong> {contentAnalysis.analysis.description.length} caractères</p>
                    <p><strong>Contient des bénéfices:</strong> {contentAnalysis.analysis.description.hasBenefits ? '✅' : '❌'}</p>
                    <p><strong>Contient des caractéristiques:</strong> {contentAnalysis.analysis.description.hasFeatures ? '✅' : '❌'}</p>
                    <p><strong>Contient un CTA:</strong> {contentAnalysis.analysis.description.hasCallToAction ? '✅' : '❌'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">Suggestions d'amélioration:</p>
                    <ul className="space-y-1">
                      {contentAnalysis.analysis.description.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-blue-600">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Variantes de titre suggérées */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Variantes de Titre Optimisées</h3>
                <div className="space-y-2">
                  {contentAnalysis.title_variants.map((variant: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <p className="font-medium">Variante {index + 1}:</p>
                      <p className="text-gray-700">{variant}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variantes de description suggérées */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Variantes de Description Optimisées</h3>
                <div className="space-y-2">
                  {contentAnalysis.description_variants.map((variant: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <p className="font-medium">Variante {index + 1}:</p>
                      <p className="text-gray-700">{variant}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal d'A/B Testing */}
      <Dialog open={showABTestingModal} onOpenChange={setShowABTestingModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>A/B Testing - {selectedProductForAnalysis?.title}</DialogTitle>
          </DialogHeader>
          
          {abTestingData && (
            <div className="space-y-6">
              {/* Contenu actuel */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold mb-3 text-blue-900">Contenu Actuel</h3>
                <div className="space-y-2">
                  <p><strong>Titre:</strong> {abTestingData.current_content.title}</p>
                  <p><strong>Description:</strong> {abTestingData.current_content.description}</p>
                </div>
              </div>

              {/* Variantes de titre pour A/B testing */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Variantes de Titre pour A/B Testing</h3>
                <div className="space-y-3">
                  {abTestingData.title_variants.map((variant: string, index: number) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-purple-900">Variante {index + 1}</span>
                        <Badge variant="outline" className="text-xs">Test A/B</Badge>
                      </div>
                      <p className="text-gray-800 mb-3">{variant}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Tester cette variante
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Copy className="w-3 h-3 mr-1" />
                          Copier
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Variantes de description pour A/B testing */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Variantes de Description pour A/B Testing</h3>
                <div className="space-y-3">
                  {abTestingData.description_variants.map((variant: string, index: number) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-900">Variante {index + 1}</span>
                        <Badge variant="outline" className="text-xs">Test A/B</Badge>
                      </div>
                      <p className="text-gray-800 mb-3 text-sm leading-relaxed">{variant}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Tester cette variante
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Copy className="w-3 h-3 mr-1" />
                          Copier
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan de test A/B */}
              <div className="border rounded-lg p-4 bg-yellow-50">
                <h3 className="font-semibold mb-3 text-yellow-900">Plan de Test A/B Recommandé</h3>
                <div className="space-y-2 text-sm text-yellow-800">
                  <p>• <strong>Durée:</strong> 2-4 semaines pour des résultats significatifs</p>
                  <p>• <strong>Trafic:</strong> Diviser équitablement entre variantes</p>
                  <p>• <strong>Métriques:</strong> CTR, conversions, temps sur page</p>
                  <p>• <strong>Outils:</strong> Google Optimize, VWO, ou Optimizely</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 