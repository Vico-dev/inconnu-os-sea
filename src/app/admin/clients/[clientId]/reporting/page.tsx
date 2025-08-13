"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Euro, 
  Users, 
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react"

interface ClientData {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string
  clientAccount?: {
    id: string
    company: {
      name: string
      industry: string
    }
    subscription: {
      plan: string
      status: string
    }
  }
}

interface GoogleAdsData {
  campaigns: Array<{
    id: string
    name: string
    status: string
    impressions: number
    clicks: number
    cost: number
    conversions: number
    ctr: number
    cpc: number
    cpm: number
  }>
  metrics: {
    totalImpressions: number
    totalClicks: number
    totalCost: number
    totalConversions: number
    averageCtr: number
    averageCpc: number
    averageCpm: number
    totalCampaigns: number
    activeCampaigns: number
  }
}

export default function ClientReportingPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const { user } = useAuth()
  
  console.log("🔍 Page de reporting - Utilisateur actuel:", {
    userId: user?.id,
    userRole: user?.role,
    isAdmin: user?.role === 'ADMIN'
  })
  
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [googleAdsData, setGoogleAdsData] = useState<GoogleAdsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClientData()
  }, [clientId])

  const fetchClientData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🔍 Récupération des données pour le client:", clientId)

      // Récupérer les données du client
      console.log("🔗 Appel API:", `/api/admin/users/${clientId}`)
      const clientResponse = await fetch(`/api/admin/users/${clientId}`)
      console.log("📊 Réponse API:", clientResponse.status, clientResponse.statusText)
      if (clientResponse.ok) {
        const clientResult = await clientResponse.json()
        console.log("✅ Données client récupérées:", clientResult.user)
        setClientData(clientResult.user)
        
        // Récupérer les données Google Ads du client
        if (clientResult.user.clientAccount?.id) {
          console.log("🔗 ClientAccount trouvé, récupération Google Ads...")
          await fetchGoogleAdsData(clientResult.user.clientAccount.id)
        } else {
          console.log("⚠️ Pas de ClientAccount pour ce client")
        }
      } else {
        console.log("❌ Erreur lors de la récupération du client")
        setError("Client non trouvé")
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données client:", error)
      setError("Erreur lors du chargement des données")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGoogleAdsData = async (clientAccountId?: string) => {
    if (!clientAccountId) {
      console.log("❌ Pas de clientAccountId fourni")
      return
    }

    try {
      console.log("🔍 Récupération Google Ads pour clientAccountId:", clientAccountId)
      const response = await fetch(`/api/admin/clients/${clientAccountId}/google-ads-data`)
      
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Données Google Ads récupérées:", data)
        setGoogleAdsData(data.data)
      } else {
        const errorData = await response.json()
        console.log("❌ Erreur Google Ads:", errorData)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données Google Ads:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchClientData()
    setIsRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ENABLED':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case 'TRIAL':
        return <Badge className="bg-blue-100 text-blue-800">Essai</Badge>
      case 'CANCELLED':
      case 'PAUSED':
        return <Badge className="bg-red-100 text-red-800">Inactif</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement du reporting client...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  if (error || !clientData) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="p-6">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
              <p className="text-gray-600">{error || "Client non trouvé"}</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reporting - {clientData.firstName} {clientData.lastName}
              </h1>
              <p className="text-gray-600 mt-2">
                {clientData.clientAccount?.company?.name || clientData.company}
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualisation...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualiser
                </>
              )}
            </Button>
          </div>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Contact</h4>
                  <p className="text-gray-600">{clientData.firstName} {clientData.lastName}</p>
                  <p className="text-gray-600">{clientData.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Entreprise</h4>
                  <p className="text-gray-600">{clientData.clientAccount?.company?.name || clientData.company}</p>
                  <p className="text-gray-600">{clientData.clientAccount?.company?.industry}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Abonnement</h4>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(clientData.clientAccount?.subscription?.status || 'UNKNOWN')}
                    <span className="text-gray-600">{clientData.clientAccount?.subscription?.plan}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs pour différents types de reporting */}
          <Tabs defaultValue="google-ads" className="space-y-4">
            <TabsList>
              <TabsTrigger value="google-ads">Google Ads</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            </TabsList>

            <TabsContent value="google-ads" className="space-y-4">
              {googleAdsData ? (
                <>
                  {/* Métriques Google Ads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(googleAdsData.metrics.totalImpressions)}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clics</CardTitle>
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(googleAdsData.metrics.totalClicks)}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coût total</CardTitle>
                        <Euro className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(googleAdsData.metrics.totalCost)}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(googleAdsData.metrics.totalConversions)}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Métriques dérivées */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">CTR moyen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPercentage(googleAdsData.metrics.averageCtr)}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">CPC moyen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(googleAdsData.metrics.averageCpc)}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">CPM moyen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(googleAdsData.metrics.averageCpm)}</div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée Google Ads</h3>
                    <p className="text-gray-600">
                      Ce client n'a pas encore de données Google Ads disponibles.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse de performance</CardTitle>
                  <CardDescription>
                    Graphiques et tendances de performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                    <p>Graphiques de performance à venir...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-4">
              {googleAdsData && googleAdsData.campaigns.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Campagnes Google Ads</CardTitle>
                    <CardDescription>
                      {googleAdsData.campaigns.length} campagne{googleAdsData.campaigns.length > 1 ? 's' : ''} au total
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {googleAdsData.campaigns.map((campaign) => (
                        <div key={campaign.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <Badge variant={campaign.status === 'ENABLED' ? 'default' : 'secondary'}>
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Impressions:</span>
                              <div className="font-medium">{formatNumber(campaign.impressions)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Clics:</span>
                              <div className="font-medium">{formatNumber(campaign.clicks)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Coût:</span>
                              <div className="font-medium">{formatCurrency(campaign.cost)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">CTR:</span>
                              <div className="font-medium">{formatPercentage(campaign.ctr)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune campagne</h3>
                    <p className="text-gray-600">
                      Aucune campagne Google Ads trouvée pour ce client.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 