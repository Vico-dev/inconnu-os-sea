// Système d'analytics avancé pour les prospects
export interface ProspectAnalytics {
  prospectId: string
  email: string
  totalInteractions: number
  engagementScore: number
  lastActivity: Date
  conversionProbability: number
  preferredContent: string[]
  timeOnSite: number
  pagesVisited: string[]
  conversionPath: string[]
}

export class ProspectAnalyticsService {
  private static instance: ProspectAnalyticsService
  private analyticsData: Map<string, ProspectAnalytics> = new Map()

  static getInstance(): ProspectAnalyticsService {
    if (!ProspectAnalyticsService.instance) {
      ProspectAnalyticsService.instance = new ProspectAnalyticsService()
    }
    return ProspectAnalyticsService.instance
  }

  // Calculer la probabilité de conversion
  calculateConversionProbability(prospect: any): number {
    let probability = 0

    // Score d'engagement (40% du poids)
    const engagementWeight = 0.4
    const engagementScore = prospect.engagementScore || 0
    probability += (engagementScore / 100) * engagementWeight

    // Budget (25% du poids)
    const budgetWeight = 0.25
    if (prospect.budget) {
      if (prospect.budget >= 5000) probability += budgetWeight
      else if (prospect.budget >= 2000) probability += budgetWeight * 0.8
      else if (prospect.budget >= 1000) probability += budgetWeight * 0.6
      else if (prospect.budget >= 500) probability += budgetWeight * 0.4
      else probability += budgetWeight * 0.2
    }

    // Urgence (20% du poids)
    const urgencyWeight = 0.2
    if (prospect.urgency === 'high') probability += urgencyWeight
    else if (prospect.urgency === 'medium') probability += urgencyWeight * 0.7
    else if (prospect.urgency === 'low') probability += urgencyWeight * 0.3

    // Source (15% du poids)
    const sourceWeight = 0.15
    if (prospect.source === 'REFERRAL') probability += sourceWeight
    else if (prospect.source === 'WEBSITE') probability += sourceWeight * 0.8
    else if (prospect.source === 'LINKEDIN') probability += sourceWeight * 0.6
    else probability += sourceWeight * 0.4

    return Math.min(probability * 100, 100) // Retourner en pourcentage
  }

  // Analyser le parcours de conversion
  analyzeConversionPath(interactions: any[]): string[] {
    const path = interactions
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(interaction => interaction.action)
      .filter((action, index, array) => array.indexOf(action) === index) // Dédupliquer

    return path
  }

  // Identifier le contenu préféré
  identifyPreferredContent(interactions: any[]): string[] {
    const contentActions = interactions.filter(i => 
      ['content_download', 'case_study_view', 'video_watch', 'pricing_view'].includes(i.action)
    )

    const contentCount = contentActions.reduce((acc, interaction) => {
      const content = interaction.details?.file || interaction.details?.caseStudyId || interaction.details?.videoId || 'pricing'
      acc[content] = (acc[content] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(contentCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([content]) => content)
  }

  // Calculer le temps passé sur le site
  calculateTimeOnSite(interactions: any[]): number {
    if (interactions.length < 2) return 0

    const sortedInteractions = interactions
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    const firstInteraction = new Date(sortedInteractions[0].timestamp)
    const lastInteraction = new Date(sortedInteractions[sortedInteractions.length - 1].timestamp)

    return Math.round((lastInteraction.getTime() - firstInteraction.getTime()) / 1000 / 60) // En minutes
  }

  // Générer des recommandations personnalisées
  generateRecommendations(prospect: any, interactions: any[]): string[] {
    const recommendations = []

    // Basé sur le contenu consulté
    const preferredContent = this.identifyPreferredContent(interactions)
    if (preferredContent.includes('pricing')) {
      recommendations.push("Proposer une démonstration personnalisée")
    }
    if (preferredContent.includes('case_study')) {
      recommendations.push("Partager des cas d'usage similaires")
    }
    if (preferredContent.includes('video')) {
      recommendations.push("Envoyer des vidéos explicatives")
    }

    // Basé sur l'engagement
    const engagementScore = prospect.engagementScore || 0
    if (engagementScore >= 80) {
      recommendations.push("Contacter immédiatement - Prospect très chaud")
    } else if (engagementScore >= 60) {
      recommendations.push("Programmer un appel de qualification")
    } else if (engagementScore >= 40) {
      recommendations.push("Envoyer du contenu éducatif")
    } else {
      recommendations.push("Relancer avec une offre spéciale")
    }

    // Basé sur le budget
    if (prospect.budget && prospect.budget >= 5000) {
      recommendations.push("Présenter l'offre premium")
    }

    return recommendations
  }

  // Créer un rapport d'analytics complet
  async generateAnalyticsReport(prospectId: string): Promise<ProspectAnalytics | null> {
    try {
      const response = await fetch(`/api/prospects/${prospectId}/analytics`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la génération du rapport analytics:', error)
      return null
    }
  }

  // Obtenir des insights globaux
  async getGlobalInsights(): Promise<any> {
    try {
      const response = await fetch('/api/prospects/analytics/insights')
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération des insights:', error)
      return null
    }
  }
}

// Fonctions utilitaires
export function calculateEngagementTrend(interactions: any[]): 'increasing' | 'decreasing' | 'stable' {
  if (interactions.length < 4) return 'stable'

  const recentInteractions = interactions.slice(-4)
  const olderInteractions = interactions.slice(-8, -4)

  const recentScore = recentInteractions.reduce((sum, i) => sum + (i.engagementBonus || 0), 0)
  const olderScore = olderInteractions.reduce((sum, i) => sum + (i.engagementBonus || 0), 0)

  if (recentScore > olderScore * 1.2) return 'increasing'
  if (recentScore < olderScore * 0.8) return 'decreasing'
  return 'stable'
}

export function predictNextBestAction(prospect: any, interactions: any[]): string {
  const lastInteraction = interactions[interactions.length - 1]
  
  if (!lastInteraction) return 'send_welcome_email'

  switch (lastInteraction.action) {
    case 'site_visit':
      return 'send_case_study'
    case 'form_submission':
      return 'schedule_demo_call'
    case 'content_download':
      return 'send_follow_up_email'
    case 'demo_request':
      return 'prepare_personalized_proposal'
    case 'pricing_view':
      return 'send_competitive_analysis'
    default:
      return 'send_newsletter'
  }
} 