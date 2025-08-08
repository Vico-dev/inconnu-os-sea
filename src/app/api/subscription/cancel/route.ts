import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmail, generateCancellationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { userId, reason, customReason } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { message: "Utilisateur non identifié" },
        { status: 400 }
      )
    }

    // Récupérer le compte client
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { userId: userId },
      include: {
        subscription: true
      }
    })

    if (!clientAccount) {
      return NextResponse.json(
        { message: "Compte client non trouvé" },
        { status: 404 }
      )
    }

    if (!clientAccount.subscription) {
      return NextResponse.json(
        { message: "Aucun abonnement trouvé" },
        { status: 404 }
      )
    }

    // Calculer la fin de la période en cours (mois engagé, mois dû)
    const currentDate = new Date()
    const currentPeriodEnd = clientAccount.subscription.currentPeriodEnd || new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())
    
    // Marquer l&apos;abonnement comme annulé mais garder l&apos;accès jusqu'à la fin de la période
    const cancelledSubscription = await prisma.subscription.update({
      where: { clientAccountId: clientAccount.id },
      data: {
        status: "CANCELLED",
        endDate: currentPeriodEnd, // Fin à la fin de la période en cours
        updatedAt: new Date()
      }
    })

    // Mettre à jour le statut du compte client mais garder l&apos;accès
    await prisma.clientAccount.update({
      where: { id: clientAccount.id },
      data: {
        status: "ACTIVE", // Garder actif jusqu'à la fin de la période
        endDate: currentPeriodEnd
      }
    })

    // Enregistrer la raison de résiliation (optionnel)
    if (reason) {
      // TODO: Créer un ticket de support automatique avec la raison
      console.log(`Raison de résiliation: ${reason}${customReason ? ` - ${customReason}` : ''}`)
    }

    // Envoyer un email de confirmation de résiliation
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (user) {
        const emailData = generateCancellationEmail(
          `${user.firstName} ${user.lastName}`,
          currentPeriodEnd.toLocaleDateString('fr-FR')
        )
        
        await sendEmail({
          to: user.email,
          ...emailData
        })
      }
    } catch (emailError) {
      console.error("Erreur lors de l&apos;envoi de l&apos;email:", emailError)
      // Ne pas faire échouer la résiliation si l&apos;email échoue
    }

    return NextResponse.json({
      message: "Abonnement résilié avec succès. Vous avez accès à vos services jusqu'à la fin de la période en cours.",
      subscription: {
        id: cancelledSubscription.id,
        status: cancelledSubscription.status,
        endDate: cancelledSubscription.endDate
      }
    })

  } catch (error) {
    console.error("Erreur lors de la résiliation:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 