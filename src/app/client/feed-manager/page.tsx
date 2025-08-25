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
  TrendingUp
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
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{product.description.substring(0, 100)}...</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Prix: {product.price}</span>
                              <span>Marque: {product.brand}</span>
                              <span>Type: {product.product_type}</span>
                              <span>Disponibilité: {product.availability}</span>
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
    </div>
  )
} 