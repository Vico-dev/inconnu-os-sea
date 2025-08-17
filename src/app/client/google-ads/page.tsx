"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ExternalLink, BarChart3, TrendingUp, Eye, MousePointer, Euro } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { DateRangeSelector, DateRange } from '@/components/client/DateRangeSelector'
import { GoogleAdsCharts } from '@/components/client/GoogleAdsCharts'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
  const searchParams = useSearchParams()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [daily, setDaily] = useState<any[]>([])
  const [conversionsByType, setConversionsByType] = useState<any[]>([])
  const [topKeywords, setTopKeywords] = useState<any[]>([])
  const [sortField, setSortField] = useState<'clicks' | 'ctr' | 'cpc' | 'conversions'>('clicks')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours par défaut
    endDate: new Date(),
    label: '7 derniers jours'
  })

  useEffect(() => {
    const errorParam = searchParams.get('error')
    const successParam = searchParams.get('success')

    if (errorParam) {
      setError(getErrorMessage(errorParam))
    }
    if (successParam === 'connected') {
      setSuccess('Connexion Google Ads réussie !')
      fetchGoogleAdsData()
    } else {
      // Charger les données automatiquement au chargement de la page
      fetchGoogleAdsData()
    }
  }, [searchParams])

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'auth_failed': return 'Échec de l\'authentification Google Ads'
      case 'missing_params': return 'Paramètres manquants'
      case 'token_exchange_failed': return 'Échec de l\'échange de token'
      case 'account_fetch_failed': return 'Impossible de récupérer les comptes'
      case 'callback_failed': return 'Erreur lors du callback'
      default: return 'Une erreur s\'est produite'
    }
  }

  const handleConnectGoogleAds = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/google-ads/auth')
      const data = await response.json()
      
      if (data.success) {
        window.location.href = data.authUrl
      } else {
        setError(data.error || 'Erreur lors de la connexion')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange)
    fetchGoogleAdsData(newRange)
  }

  const fetchGoogleAdsData = async (range?: DateRange) => {
    setIsLoading(true)
    setError(null)
    
    const currentRange = range || dateRange
    const params = new URLSearchParams({
      startDate: currentRange.startDate.toISOString(),
      endDate: currentRange.endDate.toISOString()
    })
    
    try {
      const response = await fetch(`/api/google-ads/data?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCampaigns(data.data.campaigns)
        setMetrics(data.data.metrics)
        setDaily(data.data.daily || [])
        setConversionsByType(data.data.conversionsByType || [])
        setTopKeywords(data.data.topKeywords || [])
      } else {
        setError(data.error || 'Erreur lors de la récupération des données')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
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

  const visibleCampaigns = includeInactive ? campaigns : campaigns.filter((c) => c.status === 'ENABLED')

  const sortedKeywords = [...topKeywords].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    const av = Number(a[sortField] || 0)
    const bv = Number(b[sortField] || 0)
    if (av === bv) return 0
    return av > bv ? dir : -dir
  })

  const sortToggle = (field: 'clicks' | 'ctr' | 'cpc' | 'conversions') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Google Ads</h1>
          <p className="text-gray-600">Gérez et analysez vos campagnes Google Ads</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchGoogleAdsData()}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Actualiser
              </>
            )}
          </Button>
          <Button
            onClick={handleConnectGoogleAds}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Connecter Google Ads
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Messages d'erreur/succès */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Top mots-clés (Search) */}
      {topKeywords.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Top 10 mots-clés (réseau de recherche)</CardTitle>
            <CardDescription>Cliques, CTR, CPC et conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Mot-clé</th>
                    <th className="py-2 pr-4">Clics</th>
                    <th className="py-2 pr-4">CTR</th>
                    <th className="py-2 pr-4">CPC</th>
                    <th className="py-2 pr-4">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {topKeywords.map((k, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{k.keyword}</td>
                      <td className="py-2 pr-4">{formatNumber(k.clicks)}</td>
                      <td className="py-2 pr-4">{formatPercentage(k.ctr)}</td>
                      <td className="py-2 pr-4">{formatCurrency(k.cpc)}</td>
                      <td className="py-2 pr-4">{formatNumber(k.conversions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* État de chargement */}
      {isLoading && !metrics && !error && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des données Google Ads...</p>
          </div>
        </div>
      )}

      {/* Message quand pas de données */}
      {!isLoading && !metrics && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée Google Ads</h3>
            <p className="text-gray-600 mb-4">
              Connectez-vous à Google Ads pour voir vos campagnes et métriques.
            </p>
            <Button onClick={handleConnectGoogleAds} className="bg-blue-600 hover:bg-blue-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              Connecter Google Ads
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sélecteur de date et métriques globales */}
      {metrics && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Métriques Google Ads</h2>
            <DateRangeSelector 
              onDateRangeChange={handleDateRangeChange}
              currentRange={dateRange}
              storageKey="ga_date_range"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coût total</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalCost)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.totalConversions)}</div>
            </CardContent>
          </Card>
        </div>
        </>
      )}

      {/* Top mots-clés (Search) */}
      {topKeywords.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Top 10 mots-clés (réseau de recherche)</CardTitle>
            <CardDescription>Cliques, CTR, CPC et conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Mot-clé</th>
                    <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => sortToggle('clicks')}>
                      Clics {sortField==='clicks' ? (sortDir==='asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => sortToggle('ctr')}>
                      CTR {sortField==='ctr' ? (sortDir==='asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => sortToggle('cpc')}>
                      CPC {sortField==='cpc' ? (sortDir==='asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => sortToggle('conversions')}>
                      Conversions {sortField==='conversions' ? (sortDir==='asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedKeywords.map((k, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{k.keyword}</td>
                      <td className="py-2 pr-4">{formatNumber(k.clicks)}</td>
                      <td className="py-2 pr-4">{formatPercentage(k.ctr)}</td>
                      <td className="py-2 pr-4">{formatCurrency(k.cpc)}</td>
                      <td className="py-2 pr-4">{formatNumber(k.conversions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphiques */}
      {(campaigns.length > 0 || daily.length > 0 || conversionsByType.length > 0) && (
        <div className="mt-8">
          <GoogleAdsCharts campaigns={campaigns} daily={daily} conversionsByType={conversionsByType} />
        </div>
      )}

      {/* Campagnes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campagnes</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="toggle-inactive">Inclure inactives</Label>
              <Switch id="toggle-inactive" checked={includeInactive} onCheckedChange={setIncludeInactive} />
            </div>
          </div>
          <CardDescription>
            {campaigns.length} campagne{campaigns.length > 1 ? 's' : ''} trouvée{campaigns.length > 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : visibleCampaigns.length > 0 ? (
            <div className="space-y-4">
              {visibleCampaigns.map((campaign) => (
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune campagne trouvée
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 