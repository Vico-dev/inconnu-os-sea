"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Target, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  Search,
  Eye,
  BarChart3
} from "lucide-react"
import { CampaignCreationWizard } from "@/components/admin/CampaignCreationWizard"
import { ClientSelector } from "@/components/admin/ClientSelector"

interface Campaign {
  id: string
  name: string
  clientName: string
  type: 'SEARCH' | 'SHOPPING' | 'PMAX' | 'DISPLAY'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  roas: number
  createdAt: string
}

interface Client {
  id: string
  name: string
  email: string
  company: string
  budget: number
  accountManager?: string
}

export default function AMCampaignsPage() {
  const { user } = useAuth()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showCreationWizard, setShowCreationWizard] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Simuler les données - seulement les clients assignés à cet AM
  // Charger les vraies données depuis l'API (filtré par AM)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les campagnes de l'AM
        const campaignsResponse = await fetch('/api/am/campaigns')
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json()
          setCampaigns(campaignsData)
        }

        // Charger les clients assignés à cet AM
        const clientsResponse = await fetch('/api/am/clients')
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          setClients(clientsData)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }
    
    fetchData()
  }, [user])

  const handleCreateCampaign = () => {
    if (!selectedClient) {
      alert("Veuillez sélectionner un client d'abord")
      return
    }
    setShowCreationWizard(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SEARCH': return <Search className="w-4 h-4" />
      case 'SHOPPING': return <ShoppingCart className="w-4 h-4" />
      case 'PMAX': return <TrendingUp className="w-4 h-4" />
      case 'DISPLAY': return <Eye className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Mes Campagnes</h1>
            <p className="text-muted-foreground">
              Gérez les campagnes de vos clients assignés
            </p>
          </div>
          <Button onClick={handleCreateCampaign} disabled={!selectedClient}>
            <Plus className="w-4 h-4 mr-2" />
            Créer une Campagne
          </Button>
        </div>

        {/* Sélecteur de Client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Sélectionner un Client
            </CardTitle>
            <CardDescription>
              Choisissez un client de votre portefeuille pour créer ou gérer des campagnes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientSelector
              clients={clients}
              selectedClient={selectedClient}
              onClientSelect={setSelectedClient}
            />
          </CardContent>
        </Card>

        {/* Tabs principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Mes Campagnes</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mes Campagnes Actives</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'ACTIVE').length}</div>
                  <p className="text-xs text-muted-foreground">
                    +1 depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}€</div>
                  <p className="text-xs text-muted-foreground">
                    +8% depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ROAS Moyen</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length).toFixed(1)}x
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +0.2x depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.conversions, 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    +3 depuis le mois dernier
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Liste des campagnes */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes Campagnes</CardTitle>
                <CardDescription>
                  Toutes les campagnes de vos clients assignés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(campaign.type)}
                        <div>
                          <h3 className="font-medium">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.clientName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{campaign.budget}€</p>
                          <p className="text-xs text-muted-foreground">Budget</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{campaign.roas}x</p>
                          <p className="text-xs text-muted-foreground">ROAS</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance de Mes Campagnes</CardTitle>
                <CardDescription>
                  Métriques détaillées de vos campagnes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Graphiques et analyses de performance à venir...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assistant de création de campagnes */}
        {showCreationWizard && (
          <CampaignCreationWizard
            isOpen={showCreationWizard}
            onClose={() => setShowCreationWizard(false)}
            selectedClient={selectedClient}
          />
        )}
      </div>
    </ProtectedRoute>
  )
} 