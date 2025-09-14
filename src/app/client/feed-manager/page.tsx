'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
  Copy,
  Edit3,
  Eye,
  Save,
  X,
  Sparkles
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { GMCExportButton } from '@/components/admin/GMCExportButton'

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
  custom_label_2: string
  gtin?: string
  ai_analysis?: {
    score: number
    subscores: {
      base_quality: number
      margin: number
      recruitment: number
      weights: any
    }
    recommendations: string[]
    image_count: number
    description_length: number
    has_stock: boolean
    price_valid: boolean
  }
  variants?: Array<{
    id: string
    title: string
    price: string
    sku?: string
    inventoryQuantity?: number
  }>
  images?: Array<{
    id: string
    url: string
    altText?: string
  }>
}

interface EditableProduct extends ShopifyProduct {
  isEditing?: boolean
  editedTitle?: string
  editedDescription?: string
  editedPrice?: string
  memberPrices?: {
    [level: string]: string
  }
}

export default function FeedManagerPage() {
  const [stores, setStores] = useState<ShopifyStore[]>([])
  const [products, setProducts] = useState<EditableProduct[]>([])
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [shopName, setShopName] = useState('')
  const [activeTab, setActiveTab] = useState('catalogue')
  const [selectedProduct, setSelectedProduct] = useState<EditableProduct | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null) // productId + type
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'title' | 'image' | 'gtin'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterScore, setFilterScore] = useState<number | null>(null)
  const [filterText, setFilterText] = useState('')
  const [filterHasImage, setFilterHasImage] = useState<boolean | null>(null)
  const [filterHasGtin, setFilterHasGtin] = useState<boolean | null>(null)

  // Prix membres simplifiés (2 niveaux)
  const memberPriceTypes = ['PUBLIC', 'MEMBER']

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
        const productsWithEdits = (data.products || []).map((p: ShopifyProduct) => {
          const mainPrice = p.variants?.[0]?.price || p.price || '0'
          const mainImage = p.images?.[0]?.url || p.image_link || ''
          return {
            ...p,
            image_link: mainImage, // Corriger l'image principale
            editedTitle: p.title,
            editedDescription: p.description,
            editedPrice: mainPrice,
            memberPrices: {
              PUBLIC: mainPrice,
              MEMBER: (parseFloat(mainPrice) * 0.9).toFixed(2) // Prix membre à -10%
            }
          }
        })
        setProducts(productsWithEdits)
        setSelectedStore(storeId)
        setActiveTab('catalogue')
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

  const startEditing = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, isEditing: true } : p
    ))
  }

  const cancelEditing = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { 
        ...p, 
        isEditing: false,
        editedTitle: p.title,
        editedDescription: p.description,
        editedPrice: p.price
      } : p
    ))
  }

  const saveProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    try {
      // Sauvegarder l'optimisation (persistance)
      const gtin = product.gtin || product.variants?.[0]?.sku || product.id
      const response = await fetch('/api/feed/optimizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gtin,
          language: 'fr',
          originalTitle: product.title,
          originalDescription: product.description,
          originalPublicPrice: parseFloat(product.price || '0'),
          originalCurrency: 'EUR',
          aiTitle: product.editedTitle || product.title,
          aiDescription: product.editedDescription || product.description,
          aiPublicPrice: parseFloat((product.memberPrices?.MEMBER || product.editedPrice || product.price || '0') as string),
          status: 'DRAFT'
        })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Erreur API de sauvegarde')
      }

      toast.success('Produit sauvegardé avec succès')
      
      setProducts(products.map(p => 
        p.id === productId ? { 
          ...p, 
          isEditing: false,
          title: p.editedTitle || p.title,
          description: p.editedDescription || p.description,
          price: p.editedPrice || p.price
        } : p
      ))
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const openProductModal = (product: EditableProduct) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      previewCSV(file)
    } else {
      toast.error('Veuillez sélectionner un fichier CSV valide')
    }
  }

  const previewCSV = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split('\n')
      const headers = lines[0].split(',')
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',')
        const row: any = {}
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || ''
        })
        return row
      })
      setCsvPreview(preview)
    }
    reader.readAsText(file)
  }

  const importCSV = async () => {
    if (!csvFile) return

    try {
      // TODO: Appeler l'API pour importer le CSV
      toast.success('CSV importé avec succès')
      setShowImportModal(false)
      setCsvFile(null)
      setCsvPreview([])
    } catch (error) {
      toast.error('Erreur lors de l\'import')
    }
  }

  const generateAI = async (productId: string, type: 'title' | 'description' | 'price') => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    setIsGeneratingAI(`${productId}-${type}`)
    
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          gtin: product.gtin || product.id,
          targetType: type,
          currentTitle: product.title,
          currentDescription: product.description,
          currentPrice: parseFloat(product.price),
          category: product.product_type,
          brand: product.brand
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          if (type === 'price' && result.data.price) {
            // Mettre à jour le prix
            setProducts(prev => prev.map(p => 
              p.id === productId 
                ? { ...p, editedPrice: result.data.price.toString() }
                : p
            ))
            toast.success('Prix optimisé avec IA')
          } else if (result.data.content) {
            // Mettre à jour le titre ou la description
            setProducts(prev => prev.map(p => 
              p.id === productId 
                ? { 
                    ...p, 
                    [type === 'title' ? 'editedTitle' : 'editedDescription']: result.data.content 
                  }
                : p
            ))
            toast.success(`${type === 'title' ? 'Titre' : 'Description'} généré avec IA`)
          }
        } else {
          toast.error('Erreur lors de la génération IA')
        }
      } else {
        toast.error('Erreur lors de la génération IA')
      }
    } catch (error) {
      console.error('Erreur génération IA:', error)
      toast.error('Erreur lors de la génération IA')
    } finally {
      setIsGeneratingAI(null)
    }
  }

  const getPerformanceScore = (score: string) => {
    const numScore = parseInt(score)
    if (numScore >= 80) return { color: 'bg-green-100 text-green-800', label: 'Excellent' }
    if (numScore >= 60) return { color: 'bg-yellow-100 text-yellow-800', label: 'Bon' }
    return { color: 'bg-red-100 text-red-800', label: 'À améliorer' }
  }

  // Fonctions de filtrage et tri
  const filteredAndSortedProducts = products
    .filter(product => {
      // Filtre par score minimum
      if (filterScore !== null) {
        const score = parseInt(product.custom_label_2) || 0
        if (score < filterScore) return false
      }
      
      // Filtre par texte (titre, description, marque)
      if (filterText) {
        const searchText = filterText.toLowerCase()
        const matches = 
          product.title.toLowerCase().includes(searchText) ||
          product.description.toLowerCase().includes(searchText) ||
          product.brand.toLowerCase().includes(searchText)
        if (!matches) return false
      }
      
      // Filtre par présence d'image
      if (filterHasImage !== null) {
        const hasImage = !!product.image_link
        if (hasImage !== filterHasImage) return false
      }
      
      // Filtre par présence de GTIN
      if (filterHasGtin !== null) {
        const hasGtin = !!product.gtin
        if (hasGtin !== filterHasGtin) return false
      }
      
      return true
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'score':
          aValue = parseInt(a.custom_label_2) || 0
          bValue = parseInt(b.custom_label_2) || 0
          break
        case 'price':
          aValue = parseFloat(a.price) || 0
          bValue = parseFloat(b.price) || 0
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'image':
          aValue = a.image_link ? 1 : 0
          bValue = b.image_link ? 1 : 0
          break
        case 'gtin':
          aValue = a.gtin ? 1 : 0
          bValue = b.gtin ? 1 : 0
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Catalogue Produits</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Gérez et optimisez vos produits pour Google Merchant Center
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Button onClick={() => setShowImportModal(true)} variant="outline" className="flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button onClick={() => setShowConnectDialog(true)} className="flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Connecter Shopify</span>
            <span className="sm:hidden">Connecter</span>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Boutiques connectées</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stores.length}</p>
              </div>
              <Store className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Produits total</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{products.length}</p>
              </div>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Score moyen</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {products.length > 0 
                    ? Math.round(products.reduce((sum, p) => sum + parseInt(p.custom_label_2), 0) / products.length)
                    : 0
                  }/100
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Dernière sync</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">
                  {stores.length > 0 ? 'Aujourd\'hui' : 'Jamais'}
                </p>
              </div>
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface principale */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="catalogue" className="text-xs sm:text-sm">Catalogue</TabsTrigger>
          <TabsTrigger value="ab-testing" className="text-xs sm:text-sm">Tests A/B</TabsTrigger>
          <TabsTrigger value="stores" className="text-xs sm:text-sm">Boutiques</TabsTrigger>
          <TabsTrigger value="export" className="text-xs sm:text-sm">Export GMC</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Catalogue des Produits</CardTitle>
                {selectedStore && (
                  <GMCExportButton 
                    products={products} 
                    onExportComplete={(result) => {
                      if (result.success) {
                        toast.success(`Export réussi: ${result.exportedCount} produits exportés vers GMC`);
                      } else {
                        toast.error(`Export partiel: ${result.exportedCount} exportés, ${result.errors?.length || 0} erreurs`);
                      }
                    }}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Contrôles de filtrage et tri */}
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {/* Recherche texte */}
                  <div>
                    <Label htmlFor="search-text">Recherche</Label>
                    <Input
                      id="search-text"
                      placeholder="Titre, description, marque..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                    />
                  </div>
                  
                  {/* Score minimum */}
                  <div>
                    <Label htmlFor="min-score">Score minimum</Label>
                    <Select value={filterScore?.toString() || 'all'} onValueChange={(value) => setFilterScore(value === 'all' ? null : parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les scores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les scores</SelectItem>
                        <SelectItem value="80">80+ (Excellent)</SelectItem>
                        <SelectItem value="60">60+ (Bon)</SelectItem>
                        <SelectItem value="40">40+ (Moyen)</SelectItem>
                        <SelectItem value="20">20+ (Faible)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Tri */}
                  <div>
                    <Label htmlFor="sort-by">Trier par</Label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="score">Score</SelectItem>
                        <SelectItem value="price">Prix</SelectItem>
                        <SelectItem value="title">Titre</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="gtin">GTIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Ordre */}
                  <div>
                    <Label htmlFor="sort-order">Ordre</Label>
                    <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Décroissant</SelectItem>
                        <SelectItem value="asc">Croissant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Filtres rapides */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    variant={filterHasImage === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterHasImage(filterHasImage === true ? null : true)}
                  >
                    Avec image
                  </Button>
                  <Button
                    variant={filterHasGtin === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterHasGtin(filterHasGtin === true ? null : true)}
                  >
                    Avec GTIN
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterText('')
                      setFilterScore(null)
                      setFilterHasImage(null)
                      setFilterHasGtin(null)
                    }}
                  >
                    Effacer filtres
                  </Button>
                </div>
                
                {/* Résultats */}
                <div className="text-sm text-gray-600">
                  {filteredAndSortedProducts.length} produit(s) sur {products.length} total
                </div>
              </div>
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
                <>
                  {/* Version mobile - Cartes */}
                  <div className="block lg:hidden space-y-4">
                    {filteredAndSortedProducts.map((product) => {
                      const score = getPerformanceScore(product.custom_label_2)
                      return (
                        <Card key={product.id} className="p-4">
                          <div className="flex gap-4">
                            {/* Image */}
                            <div className="flex-shrink-0">
                              {product.image_link ? (
                                <img 
                                  src={product.image_link} 
                                  alt={product.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Contenu */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">
                                {product.editedTitle || product.title}
                              </h3>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {product.editedDescription || product.description || 'Aucune description'}
                              </p>
                              
                              {/* Score et prix */}
                              <div className="flex items-center justify-between mt-2">
                                <Badge className={`text-xs ${score.color}`}>
                                  {product.custom_label_2}/100
                                </Badge>
                                <span className="text-sm font-medium">
                                  {product.price}€
                                </span>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateAI(product.id, 'title')}
                                  className="h-8 text-xs"
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Titre
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => generateAI(product.id, 'description')}
                                  className="h-8 text-xs"
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Desc
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Version desktop - Tableau */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Image</th>
                        <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Titre</th>
                        <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Description</th>
                        <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Prix Membre</th>
                        <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Score Global</th>
                        <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Sous-scores</th>
                        <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedProducts.map((product) => {
                        const score = getPerformanceScore(product.custom_label_2)
                        return (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="border border-gray-200 p-3">
                              {product.image_link ? (
                                <img 
                                  src={product.image_link} 
                                  alt={product.title}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="border border-gray-200 p-3">
                              {product.isEditing ? (
                                <Input
                                  value={product.editedTitle || ''}
                                  onChange={(e) => setProducts(products.map(p => 
                                    p.id === product.id ? { ...p, editedTitle: e.target.value } : p
                                  ))}
                                  className="w-full"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{product.editedTitle || product.title}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => generateAI(product.id, 'title')}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="border border-gray-200 p-3">
                              {product.isEditing ? (
                                <Textarea
                                  value={product.editedDescription || ''}
                                  onChange={(e) => setProducts(products.map(p => 
                                    p.id === product.id ? { ...p, editedDescription: e.target.value } : p
                                  ))}
                                  className="w-full min-h-[60px]"
                                  placeholder="Description du produit..."
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 max-w-xs truncate">
                                    {product.editedDescription || product.description || 'Aucune description'}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => generateAI(product.id, 'description')}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </td>
                            <td className="border border-gray-200 p-3">
                              <div className="space-y-1">
                                {memberPriceTypes.map(type => (
                                  <div key={type} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 w-12">{type === 'PUBLIC' ? 'Public' : 'Membre'}:</span>
                                    <Input
                                      value={type === 'PUBLIC' ? product.price : (product.memberPrices?.[type] || product.price)}
                                      onChange={(e) => setProducts(products.map(p => 
                                        p.id === product.id ? { 
                                          ...p, 
                                          memberPrices: { 
                                            ...p.memberPrices, 
                                            [type]: e.target.value 
                                          } 
                                        } : p
                                      ))}
                                      className="w-16 h-6 text-xs"
                                      type="number"
                                      step="0.01"
                                    />
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="border border-gray-200 p-3">
                              <Badge className={score.color}>{score.label}</Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                {product.custom_label_2}/100
                              </div>
                            </td>
                            <td className="border border-gray-200 p-3">
                              {product.ai_analysis?.subscores ? (
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Qualité:</span>
                                    <span className="font-medium">{product.ai_analysis.subscores.base_quality}/50</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Marge:</span>
                                    <span className="font-medium">{product.ai_analysis.subscores.margin}/25</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Recrutement:</span>
                                    <span className="font-medium">{product.ai_analysis.subscores.recruitment}/25</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">Non calculé</span>
                              )}
                            </td>
                            <td className="border border-gray-200 p-3">
                              <div className="flex items-center gap-2">
                                {product.isEditing ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => saveProduct(product.id)}
                                      className="h-8 px-2"
                                    >
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => cancelEditing(product.id)}
                                      className="h-8 px-2"
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => startEditing(product.id)}
                                      className="h-8 px-2"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openProductModal(product)}
                                      className="h-8 px-2"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tests A/B - Optimisation des Produits</CardTitle>
              <CardDescription>
                Créez et gérez des tests A/B pour optimiser vos titres, descriptions et prix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tests A/B en cours de développement</h3>
                <p className="text-gray-500 mb-4">
                  Cette fonctionnalité permettra de tester différentes variantes de vos produits
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Test de titres alternatifs</p>
                  <p>• Test de descriptions</p>
                  <p>• Test de prix membres</p>
                  <p>• Métriques de performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <p className="text-sm text-gray-400 mb-4">Vos produits seront automatiquement optimisés avec l&apos;IA</p>
                  <GMCExportButton 
                    products={products} 
                    onExportComplete={(result) => {
                      if (result.success) {
                        toast.success(`Export réussi: ${result.exportedCount} produits exportés vers GMC`);
                      } else {
                        toast.error(`Export partiel: ${result.exportedCount} exportés, ${result.errors?.length || 0} erreurs`);
                      }
                    }}
                  />
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

      {/* Modal d'import CSV */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import CSV - Enrichissement des produits</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="csv-file">Fichier CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Format attendu: GTIN, Titre, Description, Prix Public, Prix Membre
              </p>
            </div>

            {csvPreview.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Aperçu du CSV</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        {Object.keys(csvPreview[0]).map(header => (
                          <th key={header} className="border border-gray-200 p-2 text-left text-sm font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-200 p-2 text-sm">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Annuler
              </Button>
              <Button onClick={importCSV} disabled={!csvFile}>
                Importer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de fiche produit */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fiche Produit - {selectedProduct?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Titre du produit</Label>
                  <Input
                    value={selectedProduct.editedTitle || selectedProduct.title}
                    onChange={(e) => setSelectedProduct({...selectedProduct, editedTitle: e.target.value})}
                    className="w-full"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateAI(selectedProduct.id, 'title')}
                    className="mt-2"
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    Générer avec IA
                  </Button>
                </div>

                <div>
                  <Label>Prix public</Label>
                  <Input
                    value={selectedProduct.editedPrice || selectedProduct.price}
                    onChange={(e) => setSelectedProduct({...selectedProduct, editedPrice: e.target.value})}
                    className="w-full"
                    type="number"
                    step="0.01"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateAI(selectedProduct.id, 'price')}
                    className="mt-2"
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    Optimiser avec IA
                  </Button>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedProduct.editedDescription || selectedProduct.description}
                  onChange={(e) => setSelectedProduct({...selectedProduct, editedDescription: e.target.value})}
                  className="w-full min-h-[100px]"
                  placeholder="Description du produit..."
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generateAI(selectedProduct.id, 'description')}
                  className="mt-2"
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  Générer avec IA
                </Button>
              </div>

              <div>
                <Label>Prix membres</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {memberPriceTypes.map(type => (
                    <div key={type} className="space-y-2">
                      <Label className="text-sm">{type === 'PUBLIC' ? 'Prix Public' : 'Prix Membre'}</Label>
                      <Input
                        value={type === 'PUBLIC' ? selectedProduct.price : (selectedProduct.memberPrices?.[type] || selectedProduct.price)}
                        onChange={(e) => setSelectedProduct({
                          ...selectedProduct, 
                          memberPrices: { 
                            ...selectedProduct.memberPrices, 
                            [type]: e.target.value 
                          } 
                        })}
                        className="w-full"
                        type="number"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyse IA et sous-scores */}
              {selectedProduct.ai_analysis && (
                <div>
                  <Label>Analyse IA</Label>
                  <div className="mt-2 space-y-4">
                    {/* Score global */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Score Global</span>
                        <Badge className={getPerformanceScore(selectedProduct.custom_label_2).color}>
                          {selectedProduct.custom_label_2}/100
                        </Badge>
                      </div>
                      
                      {/* Sous-scores */}
                      {selectedProduct.ai_analysis.subscores && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-blue-600">{selectedProduct.ai_analysis.subscores.base_quality}/50</div>
                            <div className="text-gray-600">Qualité</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-green-600">{selectedProduct.ai_analysis.subscores.margin}/25</div>
                            <div className="text-gray-600">Marge</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-purple-600">{selectedProduct.ai_analysis.subscores.recruitment}/25</div>
                            <div className="text-gray-600">Recrutement</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Recommandations */}
                    {selectedProduct.ai_analysis.recommendations && selectedProduct.ai_analysis.recommendations.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Recommandations</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {selectedProduct.ai_analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Métriques */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="font-medium">{selectedProduct.ai_analysis.image_count}</div>
                        <div className="text-gray-600">Images</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="font-medium">{selectedProduct.ai_analysis.description_length}</div>
                        <div className="text-gray-600">Caractères description</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowProductModal(false)}>
                  Fermer
                </Button>
                <Button onClick={() => {
                  saveProduct(selectedProduct.id)
                  setShowProductModal(false)
                }}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 