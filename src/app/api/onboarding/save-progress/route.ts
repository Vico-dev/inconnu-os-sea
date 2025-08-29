import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
    }

    const body = await request.json()
    const { step, data } = body

    // Trouver l'utilisateur et son compte client
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { clientAccount: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (!user.clientAccount) {
      return NextResponse.json({ error: 'Compte client non trouvé' }, { status: 404 })
    }

    // Sauvegarder les données selon l'étape
    let updateData: any = {}

    switch (step) {
      case 'company':
        // Sauvegarder les données de l'entreprise
        if (data.companyName) {
          await prisma.company.upsert({
            where: { clientAccountId: user.clientAccount.id },
            create: {
              clientAccountId: user.clientAccount.id,
              name: data.companyName,
              industry: data.industry || null,
              size: data.size || null,
              website: data.website || null
            },
            update: {
              name: data.companyName,
              industry: data.industry || null,
              size: data.size || null,
              website: data.website || null
            }
          })
        }
        break

      case 'budget':
        // Sauvegarder le budget Google Ads
        updateData.googleAdsBudget = data.budget
        break

      case 'plan':
        // Sauvegarder le plan sélectionné
        updateData.subscriptionPlan = data.plan
        break

      case 'payment':
        // Marquer le paiement comme effectué
        updateData.paymentCompleted = true
        break

      case 'google-ads':
        // Marquer la connexion Google Ads comme effectuée
        updateData.googleAdsConnected = true
        updateData.onboardingCompleted = true // Onboarding terminé
        break
    }

    // Mettre à jour le ClientAccount
    if (Object.keys(updateData).length > 0) {
      await prisma.clientAccount.update({
        where: { id: user.clientAccount.id },
        data: updateData
      })
    }

    return NextResponse.json({
      success: true,
      message: `Étape ${step} sauvegardée`,
      clientAccountId: user.clientAccount.id
    })

  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
} 