import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { GoogleAdsService } from '@/lib/google-ads-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, objective, type, budget, targetAudience, keywords, locations, language, description, clientAccountId } = body

    // Utiliser le compte client spécifié ou récupérer celui de l'utilisateur
    let targetClientAccountId = clientAccountId
    
    if (!targetClientAccountId) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { clientAccount: true }
      })

      if (!user?.clientAccount) {
        return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
      }
      
      targetClientAccountId = user.clientAccount.id
    }

    // Vérifier que le compte client existe
    const clientAccount = await db.clientAccount.findUnique({
      where: { id: targetClientAccountId },
      include: { user: true }
    })

    if (!clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    // Créer la campagne dans la base de données
    const campaign = await db.campaign.create({
      data: {
        name,
        type,
        objective,
        budget,
        targetAudience,
        keywords: keywords.join(','),
        locations: locations.join(','),
        language,
        description,
        status: 'DRAFT',
        clientAccountId: targetClientAccountId,
        createdBy: session.user.id
      }
    })

    // Créer la campagne dans Google Ads (si connecté)
    let googleAdsCampaignId = null
    if (clientAccount.googleAdsConnected) {
      try {
        const googleAdsResult = await GoogleAdsService.createCampaign({
          name,
          type,
          objective,
          budget,
          keywords,
          locations,
          language,
          clientAccountId: targetClientAccountId
        })
        
        googleAdsCampaignId = googleAdsResult.campaignId
        
        // Mettre à jour la campagne avec l'ID Google Ads
        await db.campaign.update({
          where: { id: campaign.id },
          data: { 
            googleAdsCampaignId,
            status: 'ACTIVE'
          }
        })
      } catch (error) {
        console.error('Erreur lors de la création dans Google Ads:', error)
        // La campagne reste en DRAFT si Google Ads échoue
      }
    }

    // Créer un workflow d'approbation si nécessaire
    if (session.user.role === 'ACCOUNT_MANAGER') {
      await db.campaignApproval.create({
        data: {
          campaignId: campaign.id,
          status: 'PENDING',
          submittedBy: session.user.id,
          approvals: {
            create: [
              {
                stepNumber: 1,
                approverRole: 'ADMIN',
                status: 'PENDING',
                required: true
              }
            ]
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        googleAdsCampaignId
      }
    })
  } catch (error) {
    console.error('Erreur lors de la création de la campagne:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la campagne' },
      { status: 500 }
    )
  }
} 