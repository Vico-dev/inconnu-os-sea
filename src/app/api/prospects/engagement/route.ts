import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { prospectId, action, details } = await request.json()

    // Vérifier que le prospect existe
    const prospect = await prisma.prospect.findUnique({
      where: { id: prospectId }
    })

    if (!prospect) {
      return NextResponse.json({ error: "Prospect non trouvé" }, { status: 404 })
    }

    // Calculer le bonus selon l'action
    let engagementBonus = 0
    let actionDescription = ""

    switch (action) {
      case 'site_visit':
        engagementBonus = 5
        actionDescription = "Visite du site"
        break
      case 'form_submission':
        engagementBonus = 15
        actionDescription = "Nouvelle soumission de formulaire"
        break
      case 'content_download':
        engagementBonus = 10
        actionDescription = "Téléchargement de contenu"
        break
      case 'email_open':
        engagementBonus = 3
        actionDescription = "Ouverture d'email"
        break
      case 'email_click':
        engagementBonus = 5
        actionDescription = "Clic sur lien email"
        break
      case 'demo_request':
        engagementBonus = 20
        actionDescription = "Demande de démonstration"
        break
      case 'appointment_request':
        engagementBonus = 25
        actionDescription = "Demande de rendez-vous"
        break
      case 'pricing_view':
        engagementBonus = 8
        actionDescription = "Consultation des tarifs"
        break
      case 'case_study_view':
        engagementBonus = 12
        actionDescription = "Consultation d'un cas d'usage"
        break
      case 'video_watch':
        engagementBonus = 15
        actionDescription = "Visionnage d'une vidéo"
        break
      case 'social_media_click':
        engagementBonus = 5
        actionDescription = "Clic sur réseau social"
        break
      case 'newsletter_signup':
        engagementBonus = 10
        actionDescription = "Inscription à la newsletter"
        break
      case 'chat_interaction':
        engagementBonus = 20
        actionDescription = "Interaction avec le chat"
        break
      case 'return_visit_7d':
        engagementBonus = 15
        actionDescription = "Retour dans les 7 jours"
        break
      case 'return_visit_30d':
        engagementBonus = 10
        actionDescription = "Retour dans les 30 jours"
        break
      default:
        engagementBonus = 0
        actionDescription = "Action inconnue"
    }

    // Mettre à jour le score d'engagement
    const currentEngagement = prospect.engagement || 'low'
    let newEngagement = currentEngagement

    // Calculer le nouveau niveau d'engagement
    const totalEngagementScore = (prospect.engagementScore || 0) + engagementBonus
    
    if (totalEngagementScore >= 50) {
      newEngagement = 'high'
    } else if (totalEngagementScore >= 25) {
      newEngagement = 'medium'
    } else {
      newEngagement = 'low'
    }

    // Mettre à jour le prospect
    const updatedProspect = await prisma.prospect.update({
      where: { id: prospectId },
      data: {
        engagement: newEngagement,
        engagementScore: totalEngagementScore,
        lastInteraction: new Date(),
        // Ajouter l'action dans les notes ou créer un champ séparé
        notes: prospect.notes 
          ? `${prospect.notes}\n\n[${new Date().toLocaleString('fr-FR')}] ${actionDescription} (+${engagementBonus} points)`
          : `[${new Date().toLocaleString('fr-FR')}] ${actionDescription} (+${engagementBonus} points)`
      }
    })

    console.log(`🎯 Prospect ${prospect.email}: ${actionDescription} (+${engagementBonus} points) - Nouveau score d'engagement: ${totalEngagementScore}`)

    return NextResponse.json({
      success: true,
      message: `Engagement mis à jour: ${actionDescription}`,
      data: {
        prospectId,
        action,
        engagementBonus,
        newEngagement,
        totalEngagementScore
      }
    })

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'engagement:", error)
    return NextResponse.json({
      error: "Erreur lors de la mise à jour de l'engagement",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 })
  }
} 