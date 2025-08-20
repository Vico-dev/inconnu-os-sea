"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface GoogleAdsChartsProps {
  campaigns: any[]
  daily: any[]
  conversionsByType: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function GoogleAdsCharts({ campaigns, daily, conversionsByType }: GoogleAdsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Calculer les métriques de performance
  const performanceMetrics = campaigns.map(campaign => ({
    name: campaign.name,
    ctr: campaign.ctr,
    cpc: campaign.cpc,
    cpm: campaign.cpm,
    conversionRate: campaign.conversions > 0 ? (campaign.conversions / campaign.clicks) * 100 : 0
  }))

  // Données pour le graphique de tendance quotidienne
  const dailyData = daily.map(day => ({
    date: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    impressions: day.impressions,
    clicks: day.clicks,
    cost: day.cost,
    conversions: day.conversions
  }))

  // Données pour la répartition des conversions
  const conversionData = conversionsByType.map(conv => ({
    name: conv.conversionType,
    value: conv.conversions,
    percentage: conv.percentage
  }))

  // Données pour la performance des campagnes
  const campaignPerformance = campaigns.map(campaign => ({
    name: campaign.name.length > 20 ? campaign.name.substring(0, 20) + '...' : campaign.name,
    clicks: campaign.clicks,
    cost: campaign.cost,
    conversions: campaign.conversions,
    ctr: campaign.ctr
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyses et tendances</CardTitle>
        <CardDescription>Visualisez vos performances Google Ads</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Tendances</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique des impressions et clics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Impressions et Clics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          formatNumber(value), 
                          name === 'impressions' ? 'Impressions' : 'Clics'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="impressions" 
                        stackId="1" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="clicks" 
                        stackId="1" 
                        stroke="#82ca9d" 
                        fill="#82ca9d" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Graphique du coût et conversions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Coût et Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'cost' ? formatCurrency(value) : formatNumber(value), 
                          name === 'cost' ? 'Coût' : 'Conversions'
                        ]}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="cost" 
                        stroke="#ff7300" 
                        strokeWidth={2}
                        dot={{ fill: '#ff7300' }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="conversions" 
                        stroke="#00c49f" 
                        strokeWidth={2}
                        dot={{ fill: '#00c49f' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique CTR par campagne */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CTR par Campagne</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [formatPercentage(value), 'CTR']}
                      />
                      <Bar dataKey="ctr" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Graphique CPC par campagne */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">CPC par Campagne</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'CPC']}
                      />
                      <Bar dataKey="cpc" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="conversions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique en camembert des conversions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Répartition des Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={conversionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {conversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [formatNumber(value), 'Conversions']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Graphique des taux de conversion */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taux de Conversion par Campagne</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [formatPercentage(value), 'Taux de conversion']}
                      />
                      <Bar dataKey="conversionRate" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique des clics par campagne */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Clics par Campagne</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={campaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [formatNumber(value), 'Clics']}
                      />
                      <Bar dataKey="clicks" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Graphique du coût par campagne */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Coût par Campagne</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={campaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Coût']}
                      />
                      <Bar dataKey="cost" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
