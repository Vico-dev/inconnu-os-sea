import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId, assetType, clientAccountId } = body

    if (!campaignId || !assetType || !clientAccountId) {
      return NextResponse.json({ 
        error: 'ID de campagne, type d\'asset et compte client requis' 
      }, { status: 400 })
    }

    // Vérifier que l'utilisateur a accès au compte client
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { clientAccount: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.clientAccount?.id !== clientAccountId)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer la campagne
    const campaign = await prisma.aICampaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 })
    }

    // Créer une tâche de génération
    const aiTask = await prisma.aITask.create({
      data: {
        clientAccountId,
        campaignId,
        taskType: assetType.toUpperCase(),
        status: 'PENDING',
        progress: 0
      }
    })

    // Démarrer la génération en arrière-plan
    generateAssets(assetType, campaign, aiTask.id)

    return NextResponse.json({
      success: true,
      taskId: aiTask.id,
      message: `Génération de ${assetType} démarrée`
    })

  } catch (error) {
    console.error('Erreur génération assets:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

async function generateAssets(assetType: string, campaign: any, taskId: string) {
  try {
    // Mettre à jour le statut de la tâche
    await prisma.aITask.update({
      where: { id: taskId },
      data: { 
        status: 'PROCESSING',
        startedAt: new Date(),
        progress: 10
      }
    })

    let generatedAssets = {}

    switch (assetType.toLowerCase()) {
      case 'keywords':
        generatedAssets = await generateKeywords(campaign)
        break
      case 'ad_copy':
        generatedAssets = await generateAdCopy(campaign)
        break
      case 'headlines':
        generatedAssets = await generateHeadlines(campaign)
        break
      case 'descriptions':
        generatedAssets = await generateDescriptions(campaign)
        break
      default:
        throw new Error(`Type d'asset non supporté: ${assetType}`)
    }

    // Mettre à jour la progression
    await prisma.aITask.update({
      where: { id: taskId },
      data: { progress: 80 }
    })

    // Mettre à jour la campagne avec les nouveaux assets
    const updateData: any = {}
    updateData[assetType.toLowerCase()] = generatedAssets

    await prisma.aICampaign.update({
      where: { id: campaign.id },
      data: updateData
    })

    // Finaliser la tâche
    await prisma.aITask.update({
      where: { id: taskId },
      data: { 
        status: 'COMPLETED',
        progress: 100,
        result: { generatedAssets },
        completedAt: new Date()
      }
    })

    console.log(`Génération de ${assetType} terminée pour la campagne ${campaign.id}`)

  } catch (error) {
    console.error('Erreur lors de la génération:', error)
    
    await prisma.aITask.update({
      where: { id: taskId },
      data: { 
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        completedAt: new Date()
      }
    })
  }
}

async function generateKeywords(campaign: any) {
  // Simulation de génération de mots-clés basée sur les données scrapées
  await new Promise(resolve => setTimeout(resolve, 1500))

  const baseKeywords = [
    'services professionnels',
    'expertise',
    'solutions',
    'consultation',
    'accompagnement'
  ]

  const industryKeywords = campaign.industry ? [
    `${campaign.industry} services`,
    `${campaign.industry} expert`,
    `${campaign.industry} solutions`
  ] : []

  const websiteKeywords = campaign.website ? [
    `${campaign.website.replace('https://', '').replace('www.', '')} services`,
    `${campaign.website.replace('https://', '').replace('www.', '')} expert`
  ] : []

  const longTailKeywords = [
    'services professionnels [ville]',
    'expert [industrie] [ville]',
    'consultation [service]',
    'accompagnement personnalisé',
    'solutions sur mesure'
  ]

  return {
    keywords: [
      ...baseKeywords,
      ...industryKeywords,
      ...websiteKeywords,
      ...longTailKeywords
    ],
    categories: {
      'Mots-clés principaux': baseKeywords,
      'Mots-clés sectoriels': industryKeywords,
      'Mots-clés long-tail': longTailKeywords
    },
    suggestions: [
      'services premium',
      'expertise spécialisée',
      'solutions innovantes',
      'accompagnement complet'
    ]
  }
}

async function generateAdCopy(campaign: any) {
  // Simulation de génération de textes d'annonces
  await new Promise(resolve => setTimeout(resolve, 2000))

  return {
    headlines: [
      'Services Professionnels de Qualité',
      'Expertise Reconnue dans le Secteur',
      'Solutions Personnalisées pour Votre Entreprise',
      'Accompagnement Complet et Sur Mesure',
      'Résultats Garantis et Mesurables'
    ],
    descriptions: [
      'Découvrez nos services professionnels adaptés à vos besoins. Expertise reconnue et résultats garantis.',
      'Solutions innovantes et personnalisées pour votre entreprise. Accompagnement complet et suivi rigoureux.',
      'Expertise spécialisée dans votre secteur. Services premium avec résultats mesurables et ROI optimisé.'
    ],
    callToActions: [
      'Demander un devis gratuit',
      'Réserver une consultation',
      'Découvrir nos services',
      'Nous contacter',
      'En savoir plus'
    ]
  }
}

async function generateHeadlines(campaign: any) {
  // Simulation de génération de titres d'annonces
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    headlines: [
      {
        text: 'Services Professionnels Premium',
        characterCount: 30,
        type: 'HEADLINE_1'
      },
      {
        text: 'Expertise Reconnue & Résultats',
        characterCount: 28,
        type: 'HEADLINE_2'
      },
      {
        text: 'Solutions Sur Mesure Garanties',
        characterCount: 32,
        type: 'HEADLINE_3'
      },
      {
        text: 'Accompagnement Complet',
        characterCount: 24,
        type: 'HEADLINE_1'
      },
      {
        text: 'ROI Optimisé & Mesurable',
        characterCount: 26,
        type: 'HEADLINE_2'
      }
    ],
    variations: [
      'Services [Industrie] Experts',
      'Solutions [Service] Premium',
      'Expert [Domaine] Certifié',
      'Accompagnement [Besoin]'
    ]
  }
}

async function generateDescriptions(campaign: any) {
  // Simulation de génération de descriptions d'annonces
  await new Promise(resolve => setTimeout(resolve, 1200))

  return {
    descriptions: [
      {
        text: 'Découvrez nos services professionnels adaptés à vos besoins spécifiques. Expertise reconnue et résultats garantis.',
        characterCount: 120,
        type: 'DESCRIPTION_1'
      },
      {
        text: 'Solutions innovantes et personnalisées pour votre entreprise. Accompagnement complet avec suivi rigoureux.',
        characterCount: 118,
        type: 'DESCRIPTION_2'
      },
      {
        text: 'Expertise spécialisée dans votre secteur d\'activité. Services premium avec résultats mesurables.',
        characterCount: 115,
        type: 'DESCRIPTION_1'
      }
    ],
    longDescriptions: [
      'Notre équipe d\'experts vous accompagne dans tous vos projets avec des solutions personnalisées et innovantes. Bénéficiez de notre expertise reconnue et de nos résultats garantis.',
      'Découvrez une approche unique et professionnelle pour optimiser votre activité. Nos solutions sur mesure s\'adaptent parfaitement à vos besoins spécifiques.'
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'ID de tâche requis' }, { status: 400 })
    }

    const task = await prisma.aITask.findUnique({
      where: { id: taskId },
      include: { campaign: true }
    })

    if (!task) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        status: task.status,
        progress: task.progress,
        result: task.result,
        error: task.error,
        startedAt: task.startedAt,
        completedAt: task.completedAt
      },
      campaign: task.campaign
    })

  } catch (error) {
    console.error('Erreur récupération tâche:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 