import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ProspectAnalyticsService } from "@/lib/prospect-analytics"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospectId = params.id

    // Récupérer le prospect avec toutes ses interactions
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId },
      include: {
        // Inclure les interactions si on a une table dédiée
        // interactions: true
      }
    })

    if (!prospect) {
      return NextResponse.json({ error: "Prospect non trouvé" }, { status: 404 })
    }

    // Récupérer les interactions depuis les notes (pour l'instant)
    // TODO: Créer une table Interactions dédiée
    const interactions = parseInteractionsFromNotes(prospect.notes || "")

    const analyticsService = ProspectAnalyticsService.getInstance()

    // Calculer les métriques
    const conversionProbability = analyticsService.calculateConversionProbability(prospect)
    const conversionPath = analyticsService.analyzeConversionPath(interactions)
    const preferredContent = analyticsService.identifyPreferredContent(interactions)
    const timeOnSite = analyticsService.calculateTimeOnSite(interactions)
    const recommendations = analyticsService.generateRecommendations(prospect, interactions)

    // Créer le rapport analytics
    const analyticsReport = {
      prospectId: prospect.id,
      email: prospect.email,
      totalInteractions: interactions.length,
      engagementScore: prospect.engagementScore || 0,
      lastActivity: prospect.lastInteraction || prospect.updatedAt,
      conversionProbability,
      preferredContent,
      timeOnSite,
      pagesVisited: extractPagesFromInteractions(interactions),
      conversionPath,
      recommendations,
      engagementTrend: calculateEngagementTrend(interactions),
      nextBestAction: predictNextBestAction(prospect, interactions),
      interactions: interactions.slice(-10) // 10 dernières interactions
    }

    return NextResponse.json({
      success: true,
      data: analyticsReport
    })

  } catch (error) {
    console.error("Erreur lors de la génération du rapport analytics:", error)
    return NextResponse.json({
      error: "Erreur lors de la génération du rapport analytics",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
}

// Fonction pour parser les interactions depuis les notes
function parseInteractionsFromNotes(notes: string): any[] {
  const interactions = []
  const lines = notes.split('\n')
  
  for (const line of lines) {
    const match = line.match(/\[(.*?)\] (.*?) \(\+(\d+) points\)/)
    if (match) {
      interactions.push({
        timestamp: new Date(match[1]),
        action: mapActionFromDescription(match[2]),
        engagementBonus: parseInt(match[3]),
        details: { description: match[2] }
      })
    }
  }
  
  return interactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

// Fonction pour mapper les descriptions vers les actions
function mapActionFromDescription(description: string): string {
  const actionMap: Record<string, string> = {
    'Visite du site': 'site_visit',
    'Nouvelle soumission de formulaire': 'form_submission',
    'Téléchargement de contenu': 'content_download',
    'Ouverture d\'email': 'email_open',
    'Clic sur lien email': 'email_click',
    'Demande de démonstration': 'demo_request',
    'Demande de rendez-vous': 'appointment_request',
    'Consultation des tarifs': 'pricing_view',
    'Consultation d\'un cas d\'usage': 'case_study_view',
    'Visionnage d\'une vidéo': 'video_watch',
    'Clic sur réseau social': 'social_media_click',
    'Inscription à la newsletter': 'newsletter_signup',
    'Interaction avec le chat': 'chat_interaction',
    'Retour dans les 7 jours': 'return_visit_7d',
    'Retour dans les 30 jours': 'return_visit_30d'
  }
  
  return actionMap[description] || 'unknown'
}

// Fonction pour extraire les pages visitées
function extractPagesFromInteractions(interactions: any[]): string[] {
  const pages = interactions
    .filter(i => i.action === 'site_visit' && i.details?.page)
    .map(i => i.details.page)
    .filter((page, index, array) => array.indexOf(page) === index)
  
  return pages
}

// Fonction pour calculer la tendance d'engagement
function calculateEngagementTrend(interactions: any[]): 'increasing' | 'decreasing' | 'stable' {
  if (interactions.length < 4) return 'stable'

  const recentInteractions = interactions.slice(-4)
  const olderInteractions = interactions.slice(-8, -4)

  const recentScore = recentInteractions.reduce((sum, i) => sum + (i.engagementBonus || 0), 0)
  const olderScore = olderInteractions.reduce((sum, i) => sum + (i.engagementBonus || 0), 0)

  if (recentScore > olderScore * 1.2) return 'increasing'
  if (recentScore < olderScore * 0.8) return 'decreasing'
  return 'stable'
}

// Fonction pour prédire la prochaine meilleure action
function predictNextBestAction(prospect: any, interactions: any[]): string {
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