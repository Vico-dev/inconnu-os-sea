"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useRouter } from "next/navigation"
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Target,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"

interface GoogleAdsData {
  connection: {
    isConnected: boolean
    lastSync: string | null
    accounts: any[]
  }
  globalMetrics: {
    impressions: number
    clicks: number
    cost: number
    conversions: number
    ctr: number
    averageCpc: number
    conversionRate: number
    roas: number
  }
  campaigns: any[]
  summary: {
    totalCampaigns: number
    activeCampaigns: number
    pausedCampaigns: number
    totalBudget: number
  }
}

export default function ClientGoogleAdsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<GoogleAdsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchGoogleAdsData()
    }
  }, [user])

  const fetchGoogleAdsData = async () => {
    try {
      const response = await fetch(`/api/google-ads/data?userId=${user?.id}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      } else {
        console.error("Erreur lors du chargement des données Google Ads")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch("/api/google-ads/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      })

      if (response.ok) {
        await fetchGoogleAdsData()
      } else {
        console.error("Erreur lors de la synchronisation")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsSyncing(false)
    }
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

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["CLIENT"]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des données Google Ads...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!data?.connection.isConnected) {
    return (
      <ProtectedRoute allowedRoles={["CLIENT"]}>
        <div className="p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Google Ads non connecté</h2>
            <p className="text-gray-600 mb-4">
              Connectez votre compte Google Ads pour voir vos données de campagne
            </p>
            <Button onClick={() => router.push('/client/connect-google-ads')}>
              Connecter Google Ads
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["CLIENT"]}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Google Ads Dashboard</h1>
              <p className="text-gray-600">Vos données de campagne en temps réel</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Connecté</span>
              </Badge>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing}
                variant="outline"
                size="sm"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Synchroniser
                  </>
                )}
              </Button>
            </div>
          </div>
          {data.connection.lastSync && (
            <p className="text-sm text-gray-500 mt-2">
              Dernière synchronisation : {new Date(data.connection.lastSync).toLocaleString('fr-FR')}
            </p>
          )}
        </div>

        {/* Métriques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-600">Impressions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(data.globalMetrics.impressions)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MousePointer className="w-8 h-8 text-green-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-600">Clics</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(data.globalMetrics.clicks)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-600">Coût</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.globalMetrics.cost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-purple-600 mr-4" />
                <div>
                  <p className="text-sm text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(data.globalMetrics.conversions)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métriques de performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Taux de clic (CTR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {data.globalMetrics.ctr.toFixed(2)}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {data.globalMetrics.clicks} clics / {data.globalMetrics.impressions} impressions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Coût par clic (CPC)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(data.globalMetrics.averageCpc)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Coût moyen par clic
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Taux de conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {data.globalMetrics.conversionRate.toFixed(2)}%
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {data.globalMetrics.conversions} conversions / {data.globalMetrics.clicks} clics
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Résumé des campagnes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Résumé des campagnes</CardTitle>
            <CardDescription>
              Vue d&apos;ensemble de vos campagnes Google Ads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {data.summary.totalCampaigns}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.summary.activeCampaigns}
                </div>
                <div className="text-sm text-gray-600">Actives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {data.summary.pausedCampaigns}
                </div>
                <div className="text-sm text-gray-600">En pause</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.summary.totalBudget)}
                </div>
                <div className="text-sm text-gray-600">Budget total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des campagnes */}
        <Card>
          <CardHeader>
            <CardTitle>Vos campagnes</CardTitle>
            <CardDescription>
              Détails de vos campagnes Google Ads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.campaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune campagne trouvée</p>
                <p className="text-sm">Synchronisez vos données pour voir vos campagnes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <Badge variant={
                        campaign.status === "ENABLED" ? "default" :
                        campaign.status === "PAUSED" ? "secondary" :
                        "destructive"
                      }>
                        {campaign.status === "ENABLED" ? "Active" :
                         campaign.status === "PAUSED" ? "En pause" :
                         "Supprimée"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Impressions:</span>
                        <div className="font-medium">{formatNumber(campaign.metrics.impressions)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Clics:</span>
                        <div className="font-medium">{formatNumber(campaign.metrics.clicks)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Coût:</span>
                        <div className="font-medium">{formatCurrency(campaign.metrics.cost)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">CTR:</span>
                        <div className="font-medium">{campaign.metrics.ctr.toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
} 