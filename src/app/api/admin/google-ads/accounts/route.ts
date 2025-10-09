import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { GoogleAdsApi, Customer } from "google-ads-api"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const managerId = process.env.GOOGLE_ADS_MANAGER_CUSTOMER_ID || process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
    if (!managerId) {
      return NextResponse.json({ error: 'GOOGLE_ADS_MANAGER_CUSTOMER_ID manquant' }, { status: 400 })
    }

    // Récupérer un refresh token depuis la connexion Google Ads de l'admin
    const connection = await prisma.googleAdsConnection.findFirst({
      where: { userId: session.user.id },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }]
    })
    if (!connection?.refreshToken) {
      return NextResponse.json({ error: 'Aucune connexion Google Ads valide pour cet utilisateur' }, { status: 400 })
    }

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    })

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

    const rows = await customer.query(query)
    const accounts = rows
      .filter((r: any) => !r.customer_client.manager) // exclure les managers enfants
      .map((r: any) => ({
        customerId: String(r.customer_client.id),
        name: r.customer_client.descriptive_name,
        currency: r.customer_client.currency_code,
        status: r.customer_client.status,
      }))

    return NextResponse.json({ success: true, accounts })
  } catch (error: any) {
    console.error('Erreur listing MCC:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Erreur inconnue' }, { status: 500 })
  }
}


