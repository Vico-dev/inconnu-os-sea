import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Vérifier la session admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier les permissions admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Accès administrateur requis" }, { status: 403 })
    }

    const { customerId } = await request.json()

    if (!customerId || typeof customerId !== 'string') {
      return NextResponse.json({ error: "Customer ID requis" }, { status: 400 })
    }

    // Nettoyer le customer ID (enlever les tirets s'il y en a)
    const cleanCustomerId = customerId.replace(/[-\s]/g, '')

    // Vérifier le format (doit être numérique et avoir 10 chiffres)
    if (!/^\d{10}$/.test(cleanCustomerId)) {
      return NextResponse.json({ 
        error: "Format de Customer ID invalide. Doit contenir 10 chiffres." 
      }, { status: 400 })
    }

    // Mettre à jour la connexion Google Ads existante
    const existingConnection = await prisma.googleAdsConnection.findUnique({
      where: { userId: session.user.id }
    })

    if (!existingConnection) {
      return NextResponse.json({ 
        error: "Aucune connexion Google Ads trouvée. Connectez-vous d'abord à Google Ads." 
      }, { status: 404 })
    }

    // Tester la connexion avec le nouveau customer ID
    console.log('🔍 Test de connexion avec customer ID:', cleanCustomerId)
    
    const testResponse = await fetch(`https://googleads.googleapis.com/v15/customers/${cleanCustomerId}/googleAds:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${existingConnection.accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1"
      })
    })

    console.log('🔍 Test API Response Status:', testResponse.status)

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error('❌ Erreur test API:', errorText)
      return NextResponse.json({ 
        error: `Impossible d'accéder au compte ${cleanCustomerId}. Vérifiez que le Customer ID est correct et que vous avez les permissions nécessaires.` 
      }, { status: 400 })
    }

    const testData = await testResponse.json()
    const customerInfo = testData.results?.[0]?.customer

    // Mettre à jour la connexion avec le vrai customer ID
    await prisma.googleAdsConnection.update({
      where: { userId: session.user.id },
      data: {
        accounts: JSON.stringify([{
          customerId: cleanCustomerId,
          name: customerInfo?.descriptiveName || `Compte ${cleanCustomerId}`,
          isManager: customerInfo?.manager || false
        }])
      }
    })

    console.log('✅ Customer ID configuré avec succès:', cleanCustomerId)

    return NextResponse.json({ 
      success: true,
      customerId: cleanCustomerId,
      customerName: customerInfo?.descriptiveName,
      isManager: customerInfo?.manager
    })

  } catch (error) {
    console.error('❌ Erreur lors de la configuration du customer ID:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la configuration du customer ID" 
    }, { status: 500 })
  }
}