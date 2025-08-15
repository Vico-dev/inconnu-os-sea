import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface Campaign {
  id: string
  name: string
  status: string
  impressions: number
  clicks: number
  cost: number
  ctr: number
  cpc: number
  conversions: number
}

interface GoogleAdsChartsProps {
  campaigns: Campaign[]
}

export function GoogleAdsCharts({ campaigns }: GoogleAdsChartsProps) {
  // Préparer les données pour les graphiques
  const chartData = campaigns.map(campaign => ({
    name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
    clicks: campaign.clicks,
    cpc: campaign.cpc,
    ctr: campaign.ctr,
    conversions: campaign.conversions,
    cost: campaign.cost
  }))

  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0)
  const totalCost = campaigns.reduce((sum, campaign) => sum + campaign.cost, 0)
  const avgCpc = totalClicks > 0 ? totalCost / totalClicks : 0
  const avgCtr = campaigns.reduce((sum, campaign) => sum + campaign.ctr, 0) / campaigns.length

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Graphique des clics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">Clics par campagne</span>
            <span className="text-sm text-muted-foreground">({totalClicks} total)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'Clics']}
                labelFormatter={(label) => `Campagne: ${label}`}
              />
              <Bar dataKey="clicks" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique du CPC */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">CPC par campagne</span>
            <span className="text-sm text-muted-foreground">(Moy: {avgCpc.toFixed(2)}€)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}€`, 'CPC']}
                labelFormatter={(label) => `Campagne: ${label}`}
              />
              <Bar dataKey="cpc" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique du CTR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">CTR par campagne</span>
            <span className="text-sm text-muted-foreground">(Moy: {avgCtr.toFixed(2)}%)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'CTR']}
                labelFormatter={(label) => `Campagne: ${label}`}
              />
              <Line type="monotone" dataKey="ctr" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique des conversions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">Conversions par campagne</span>
            <span className="text-sm text-muted-foreground">
              ({campaigns.reduce((sum, c) => sum + c.conversions, 0)} total)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'Conversions']}
                labelFormatter={(label) => `Campagne: ${label}`}
              />
              <Bar dataKey="conversions" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
