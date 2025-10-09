import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { GoogleAdsApi, Customer } from "google-ads-api"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 MCC Accounts API - Début')
    const session = await getServerSession(authOptions as any)
    if (!session?.user || session.user.role !== 'ADMIN') {
      console.log('❌ MCC: accès non autorisé, role:', session?.user?.role)
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }
    
    console.log('🔍 MCC: session OK, userId:', session.user.id)

    const managerId = process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
    console.log('🔍 MCC: managerId configuré:', managerId ? 'OUI' : 'NON')
    if (!managerId) {
      console.log('❌ MCC: GOOGLE_ADS_MANAGER_CUSTOMER_ID manquant')
      return NextResponse.json({ error: 'GOOGLE_ADS_MANAGER_CUSTOMER_ID manquant' }, { status: 400 })
    }

    // Récupérer un refresh token depuis la connexion Google Ads de l'admin
    console.log('🔍 MCC: recherche connexion pour userId:', session.user.id)
    const connection = await prisma.googleAdsConnection.findFirst({
      where: { userId: session.user.id },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }]
    })
    console.log('🔍 MCC: connexion trouvée:', {
      exists: !!connection,
      hasRefreshToken: !!connection?.refreshToken,
      customerId: connection?.customerId,
      isConnected: connection?.isConnected
    })
    if (!connection?.refreshToken) {
      console.log('❌ MCC: aucune connexion Google Ads valide')
      return NextResponse.json({ error: 'Aucune connexion Google Ads valide pour cet utilisateur' }, { status: 400 })
    }

    console.log('🔍 MCC: initialisation client Google Ads API')
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    })

    console.log('🔍 MCC: création customer avec managerId:', managerId)
    const customer: Customer = client.Customer({
      customer_id: managerId,
      refresh_token: connection.refreshToken!,
      login_customer_id: managerId,
    })

    const query = `
      SELECT 
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.currency_code,
        customer_client.status,
        customer_client.manager
      FROM customer_client
      WHERE customer_client.status != 'UNSPECIFIED'
      ORDER BY customer_client.descriptive_name
    `

    console.log('🔍 MCC: exécution requête Google Ads API')
    const rows = await customer.query(query)
    console.log('🔍 MCC: requête réussie, nombre de résultats:', rows.length)
    
    const accounts = rows
      .filter((r: any) => !r.customer_client.manager) // exclure les managers enfants
      .map((r: any) => ({
        customerId: String(r.customer_client.id),
        name: r.customer_client.descriptive_name,
        currency: r.customer_client.currency_code,
        status: r.customer_client.status,
      }))

    console.log('✅ MCC: retour de', accounts.length, 'comptes')
    return NextResponse.json({ success: true, accounts })
  } catch (error: any) {
    console.error('❌ MCC: erreur listing:', error)
    console.error('🔍 MCC: détails erreur:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    return NextResponse.json({ success: false, error: error?.message || 'Erreur inconnue' }, { status: 500 })
  }
}


