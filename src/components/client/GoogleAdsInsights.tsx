"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

interface GoogleAdsInsightsProps {
  campaigns: any[]
  metrics: any
}

export function GoogleAdsInsights({ campaigns, metrics }: GoogleAdsInsightsProps) {
  const insights = []
  
  const activeCampaigns = campaigns.filter(c => c.status === 'ENABLED')
  const avgCtr = activeCampaigns.length > 0 
    ? activeCampaigns.reduce((sum, c) => sum + c.ctr, 0) / activeCampaigns.length 
    : 0

  if (avgCtr < 1) {
    insights.push({
      type: 'negative',
      title: 'CTR faible',
      description: `Votre CTR moyen de ${avgCtr.toFixed(2)}% est en dessous de la moyenne.`,
      icon: <TrendingDown className="h-4 w-4" />
    })
  }

  if (activeCampaigns.length === 0) {
    insights.push({
      type: 'negative',
      title: 'Aucune campagne active',
      description: 'Créez ou réactivez des campagnes pour générer du trafic.',
      icon: <AlertTriangle className="h-4 w-4" />
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Vos campagnes fonctionnent bien !</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <Alert key={index} className="border-red-200 bg-red-50">
                {insight.icon}
                <AlertDescription>{insight.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 