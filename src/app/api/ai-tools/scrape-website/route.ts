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
    const { website, clientAccountId, campaignName } = body

    if (!website || !clientAccountId) {
      return NextResponse.json({ error: 'Site web et compte client requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a accès au compte client
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { clientAccount: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.clientAccount?.id !== clientAccountId)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Créer une tâche de scraping
    const aiTask = await prisma.aITask.create({
      data: {
        clientAccountId,
        taskType: 'SCRAPING',
        status: 'PENDING',
        progress: 0
      }
    })

    // Démarrer le scraping en arrière-plan
    scrapeWebsite(website, aiTask.id, clientAccountId, campaignName)

    return NextResponse.json({
      success: true,
      taskId: aiTask.id,
      message: 'Scraping démarré'
    })

  } catch (error) {
    console.error('Erreur scraping website:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

async function scrapeWebsite(website: string, taskId: string, clientAccountId: string, campaignName?: string) {
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

    // Simuler le scraping (dans une vraie implémentation, on utiliserait Puppeteer ou Playwright)
    const scrapedData = await simulateWebsiteScraping(website)

    // Mettre à jour la progression
    await prisma.aITask.update({
      where: { id: taskId },
      data: { progress: 50 }
    })

    // Créer ou mettre à jour la campagne IA
    const campaign = await prisma.aICampaign.upsert({
      where: {
        id: `temp-${taskId}` // ID temporaire
      },
      update: {
        scrapedData,
        updatedAt: new Date()
      },
      create: {
        id: `temp-${taskId}`,
        clientAccountId,
        name: campaignName || `Campagne ${website}`,
        website,
        scrapedData,
        status: 'DRAFT'
      }
    })

    // Mettre à jour la progression finale
    await prisma.aITask.update({
      where: { id: taskId },
      data: { 
        status: 'COMPLETED',
        progress: 100,
        result: { campaignId: campaign.id, scrapedData },
        completedAt: new Date()
      }
    })

    console.log(`Scraping terminé pour ${website}`)

  } catch (error) {
    console.error('Erreur lors du scraping:', error)
    
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

async function simulateWebsiteScraping(website: string) {
  // Simulation du scraping - dans une vraie implémentation, on utiliserait :
  // - Puppeteer ou Playwright pour le scraping
  // - Analyse du contenu HTML
  // - Extraction des métadonnées
  // - Détection des produits/services
  
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulation du délai

  return {
    website,
    scrapedAt: new Date().toISOString(),
    pages: [
      {
        url: `${website}/`,
        title: 'Page d\'accueil',
        description: 'Site web professionnel',
        keywords: ['accueil', 'entreprise', 'services'],
        content: 'Contenu de la page d\'accueil...'
      },
      {
        url: `${website}/services`,
        title: 'Nos Services',
        description: 'Découvrez nos services',
        keywords: ['services', 'solutions', 'expertise'],
        content: 'Liste des services proposés...'
      },
      {
        url: `${website}/contact`,
        title: 'Contact',
        description: 'Contactez-nous',
        keywords: ['contact', 'devis', 'information'],
        content: 'Informations de contact...'
      }
    ],
    products: [
      {
        name: 'Service Premium',
        description: 'Service haut de gamme',
        price: 'Sur devis',
        category: 'Services'
      },
      {
        name: 'Consultation',
        description: 'Consultation spécialisée',
        price: '150€/heure',
        category: 'Services'
      }
    ],
    metadata: {
      title: 'Site Web Professionnel',
      description: 'Description du site web',
      keywords: ['professionnel', 'services', 'expertise'],
      language: 'fr',
      industry: 'Services'
    }
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