import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    // Récupérer la connexion MCC
    const mccConnection = await prisma.googleAdsConnection.findFirst({
      where: {
        userId: session.user.id,
        isConnected: true
      }
    })

    if (!mccConnection) {
      return NextResponse.json(
        { error: "Connexion MCC non établie" },
        { status: 404 }
      )
    }

    // Vérifier si le token est expiré et le rafraîchir si nécessaire
    let accessToken = mccConnection.accessToken
    if (mccConnection.tokenExpiry && new Date() > mccConnection.tokenExpiry) {
      try {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
            refresh_token: mccConnection.refreshToken!,
            grant_type: 'refresh_token',
          }),
        })

        const refreshData = await refreshResponse.json()
        if (refreshResponse.ok) {
          accessToken = refreshData.access_token
          
          // Mettre à jour le token dans la base
          await prisma.googleAdsConnection.update({
            where: { id: mccConnection.id },
            data: {
              accessToken: refreshData.access_token,
              tokenExpiry: new Date(Date.now() + refreshData.expires_in * 1000),
            }
          })
        } else {
          throw new Error('Échec du rafraîchissement du token')
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error)
        return NextResponse.json(
          { error: "Session MCC expirée" },
          { status: 401 }
        )
      }
    }

    // Récupérer les comptes clients du MCC
    const accountsResponse = await fetch('https://googleads.googleapis.com/v14/customers', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
    })

    if (!accountsResponse.ok) {
      const errorData = await accountsResponse.json()
      console.error('Erreur API Google Ads:', errorData)
      return NextResponse.json(
        { error: "Erreur lors de la récupération des comptes MCC" },
        { status: 500 }
      )
    }

    const accountsData = await accountsResponse.json()
    
    // Récupérer les liens existants
    const existingLinks = await prisma.googleAdsPermission.findMany({
      where: {
        isActive: true
      },
      include: {
        clientAccount: {
          include: {
            user: true
          }
        }
      }
    })

    // Traiter les comptes MCC
    const accounts = accountsData.results?.map((account: any) => {
      const existingLink = existingLinks.find(link => link.googleAdsCustomerId === account.customer.id)
      
      return {
        customerId: account.customer.id,
        customerName: account.customer.descriptiveName || account.customer.name,
        manager: account.customer.manager,
        testAccount: account.customer.testAccount,
        isLinked: !!existingLink,
        linkedClientId: existingLink?.clientAccount?.user?.id,
        linkedClientName: existingLink ? `${existingLink.clientAccount.user.firstName} ${existingLink.clientAccount.user.lastName}` : undefined
      }
    }) || []

    return NextResponse.json({
      success: true,
      accounts: accounts
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des comptes MCC:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des comptes MCC" },
      { status: 500 }
    )
  }
} 