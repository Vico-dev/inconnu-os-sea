import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'pdf'

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Dates manquantes' }, { status: 400 })
    }

    // Récupérer les données Google Ads
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { clientAccount: true }
    })

    if (!user?.clientAccount?.googleAdsCustomerId) {
      return NextResponse.json({ error: 'Aucun compte Google Ads connecté' }, { status: 400 })
    }

    // Récupérer les données depuis l'API Google Ads
    const googleAdsData = await fetchGoogleAdsData(
      user.clientAccount.googleAdsCustomerId,
      startDate,
      endDate
    )

    if (format === 'excel') {
      return generateExcelReport(googleAdsData, startDate, endDate)
    } else {
      return generatePDFReport(googleAdsData, startDate, endDate)
    }

  } catch (error) {
    console.error('Erreur export rapport:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du rapport' }, { status: 500 })
  }
}

async function fetchGoogleAdsData(customerId: string, startDate: string, endDate: string) {
  // Logique pour récupérer les données Google Ads
  // (similaire à celle de /api/google-ads/data)
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    },
    scopes: ['https://www.googleapis.com/auth/adwords'],
  })

  const client = await auth.getClient()
  
  // Ici, vous utiliseriez l'API Google Ads pour récupérer les données
  // Pour l'exemple, on retourne des données fictives
  return {
    campaigns: [],
    metrics: {
      totalImpressions: 0,
      totalClicks: 0,
      totalCost: 0,
      totalConversions: 0,
      averageCtr: 0,
      averageCpc: 0,
      averageCpm: 0
    },
    daily: [],
    topKeywords: []
  }
}

function generateExcelReport(data: any, startDate: string, endDate: string) {
  // Générer un rapport Excel
  const workbook = {
    sheets: [
      {
        name: 'Résumé',
        data: [
          ['Rapport Google Ads', ''],
          ['Période', `${startDate} - ${endDate}`],
          [''],
          ['Métriques', 'Valeur'],
          ['Impressions totales', data.metrics.totalImpressions],
          ['Clics totaux', data.metrics.totalClicks],
          ['Coût total', `${data.metrics.totalCost}€`],
          ['Conversions totales', data.metrics.totalConversions],
          ['CTR moyen', `${data.metrics.averageCtr}%`],
          ['CPC moyen', `${data.metrics.averageCpc}€`],
        ]
      }
    ]
  }

  // Convertir en CSV pour simplifier
  const csvContent = workbook.sheets[0].data
    .map(row => row.join(','))
    .join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="rapport-google-ads-${startDate}-${endDate}.csv"`
    }
  })
}

function generatePDFReport(data: any, startDate: string, endDate: string) {
  // Générer un rapport PDF en HTML
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rapport Google Ads</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .metric { border: 1px solid #ddd; padding: 15px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
        .metric-label { color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rapport Google Ads</h1>
        <p>Période: ${startDate} - ${endDate}</p>
      </div>
      
      <div class="metrics">
        <div class="metric">
          <div class="metric-value">${data.metrics.totalImpressions.toLocaleString()}</div>
          <div class="metric-label">Impressions</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.metrics.totalClicks.toLocaleString()}</div>
          <div class="metric-label">Clics</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.metrics.totalCost.toFixed(2)}€</div>
          <div class="metric-label">Coût total</div>
        </div>
        <div class="metric">
          <div class="metric-value">${data.metrics.totalConversions.toLocaleString()}</div>
          <div class="metric-label">Conversions</div>
        </div>
      </div>
      
      <h2>Métriques de performance</h2>
      <table>
        <tr>
          <th>Métrique</th>
          <th>Valeur</th>
        </tr>
        <tr>
          <td>CTR moyen</td>
          <td>${data.metrics.averageCtr.toFixed(2)}%</td>
        </tr>
        <tr>
          <td>CPC moyen</td>
          <td>${data.metrics.averageCpc.toFixed(2)}€</td>
        </tr>
        <tr>
          <td>CPM moyen</td>
          <td>${data.metrics.averageCpm.toFixed(2)}€</td>
        </tr>
      </table>
    </body>
    </html>
  `

  return new NextResponse(htmlContent, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="rapport-google-ads-${startDate}-${endDate}.html"`
    }
  })
} 