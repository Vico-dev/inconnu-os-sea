import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area, LabelList } from 'recharts'
import { formatCurrency } from '@/lib/utils'

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

interface DailyPoint { date: string; impressions: number; clicks: number; cost: number; conversions: number }
interface ConversionType { category: string; conversions: number }

interface GoogleAdsChartsProps {
  campaigns: Campaign[]
  daily?: DailyPoint[]
  conversionsByType?: ConversionType[]
}

export function GoogleAdsCharts({ campaigns, daily = [], conversionsByType = [] }: GoogleAdsChartsProps) {
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

  // Styles & helpers
  const COLORS = {
    clicks: '#3b82f6',
    conversions: '#8b5cf6',
    cost: '#10b981',
    bar: '#3b82f6',
    cpc: '#10b981',
  }

  const formatNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

  const mapCategory = (cat: string) => {
    switch (cat) {
      case 'PURCHASE': return 'Achat'
      case 'ADD_TO_CART': return 'Ajout au panier'
      case 'SUBMIT_LEAD_FORM': return 'Lead/Formulaire'
      case 'PAGE_VIEW': return 'Vue de page'
      case 'PHONE_CALL_LEAD': return 'Appel'
      default: return cat
    }
  }

  const convData = conversionsByType.map((d) => ({ ...d, label: mapCategory(d.category) }))

  const DailyTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    const p: Record<string, any> = {}
    payload.forEach((it: any) => (p[it.dataKey] = it.value))
    return (
      <div className="rounded-md border bg-white/95 p-2 shadow-sm text-sm">
        <div className="font-medium mb-1">{label}</div>
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full" style={{background: COLORS.clicks}} /> Clics: {formatNumber(Number(p.clicks || 0))}</div>
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full" style={{background: COLORS.conversions}} /> Conversions: {formatNumber(Number(p.conversions || 0))}</div>
        <div className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full" style={{background: COLORS.cost}} /> Coût: {formatCurrency(Number(p.cost || 0))}</div>
      </div>
    )
  }

  const BarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    const value = Number(payload[0].value || 0)
    return (
      <div className="rounded-md border bg-white/95 p-2 shadow-sm text-sm">
        <div className="font-medium mb-1">{label}</div>
        <div>Conversions: {formatNumber(value)}</div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Tendance quotidienne */}
      {daily.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Tendance quotidienne</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={daily} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.clicks} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.clicks} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.conversions} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.conversions} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => formatCurrency(Number(v)).replace(/\s/g, '\u00A0')} width={60} />
                <Tooltip content={<DailyTooltip />} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="clicks" name="Clics" stroke={COLORS.clicks} fill="url(#gClicks)" strokeWidth={2} />
                <Area yAxisId="left" type="monotone" dataKey="conversions" name="Conversions" stroke={COLORS.conversions} fill="url(#gConv)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="cost" name="Coût (€)" stroke={COLORS.cost} strokeWidth={2} dot={{ r: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Détail des conversions */}
      {conversionsByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Détail des conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={convData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<BarTooltip />} />
                <Legend />
                <Bar dataKey="conversions" fill={COLORS.conversions} radius={[6,6,0,0]}>
                  <LabelList dataKey="conversions" position="top" formatter={(v: number)=>formatNumber(Number(v))} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
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
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'Clics']}
                labelFormatter={(label) => `Campagne: ${label}`}
              />
              <Bar dataKey="clicks" fill={COLORS.bar} radius={[6,6,0,0]} />
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
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}€`, 'CPC']}
                labelFormatter={(label) => `Campagne: ${label}`}
              />
              <Bar dataKey="cpc" fill={COLORS.cpc} radius={[6,6,0,0]} />
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
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(2)}%`, 'CTR']}
                labelFormatter={(label) => `Campagne: ${label}`}
              />
              <Line type="monotone" dataKey="ctr" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
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
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'Conversions']}
                labelFormatter={(label) => `Campagne: ${label}`}
              />
              <Bar dataKey="conversions" fill={COLORS.conversions} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
