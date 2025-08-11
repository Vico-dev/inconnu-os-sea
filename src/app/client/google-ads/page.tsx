"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  MousePointer, 
  Target, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Campaign {
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
}

interface Metrics {
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

export default function GoogleAdsPage() {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    checkConnectionStatus()
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/client/account')
      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.googleAdsConnected || false)
        
        if (data.googleAdsConnected) {
          fetchGoogleAdsData()
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGoogleAdsData = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/google-ads/data')
      
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.data.campaigns || [])
        setMetrics(data.data.metrics || null)
        toast.success('Données Google Ads mises à jour !')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la récupération des données')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error)
      toast.error('Erreur de connexion')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleConnectGoogleAds = async () => {
    try {
      const response = await fetch('/api/google-ads/auth')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      } else {
        toast.error('Erreur lors de la connexion à Google Ads')
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      toast.error('Erreur de connexion')
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

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Google Ads</h1>
          <p className="text-gray-600">Gérez et analysez vos campagnes Google Ads</p>
        </div>
        
        {isConnected && (
          <Button 
            onClick={fetchGoogleAdsData} 
            disabled={isRefreshing}
            variant="outline"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Actualisation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </>
            )}
          </Button>
        )}
      </div>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Connexion Google Ads requise
            </CardTitle>
            <CardDescription>
              Connectez votre compte Google Ads pour accéder à vos données de campagnes et métriques.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnectGoogleAds} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Se connecter à Google Ads
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Métriques globales */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.totalImpressions)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clics</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.totalClicks)}</div>
                  <p className="text-xs text-muted-foreground">
                    CTR: {formatPercentage(metrics.averageCtr)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Coût total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalCost)}</div>
                  <p className="text-xs text-muted-foreground">
                    CPC moyen: {formatCurrency(metrics.averageCpc)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.totalConversions)}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.totalCampaigns} campagnes ({metrics.activeCampaigns} actives)
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Campagnes */}
          <Card>
            <CardHeader>
              <CardTitle>Campagnes</CardTitle>
              <CardDescription>
                Liste de vos campagnes Google Ads avec leurs performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune campagne trouvée
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge variant={campaign.status === 'ENABLED' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Impressions:</span>
                          <div className="font-medium">{formatNumber(campaign.impressions)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Clics:</span>
                          <div className="font-medium">{formatNumber(campaign.clicks)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Coût:</span>
                          <div className="font-medium">{formatCurrency(campaign.cost)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">CTR:</span>
                          <div className="font-medium">{formatPercentage(campaign.ctr)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 