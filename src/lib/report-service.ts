import { db } from './db'
import puppeteer from 'puppeteer'
import ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface ReportData {
  clientName: string
  period: {
    start: Date
    end: Date
  }
  campaigns: {
    id: string
    name: string
    type: string
    status: string
    budget: number
    spent: number
    impressions: number
    clicks: number
    conversions: number
    ctr: number
    cpc: number
    conversionRate: number
    roas: number
  }[]
  summary: {
    totalSpend: number
    totalImpressions: number
    totalClicks: number
    totalConversions: number
    avgCtr: number
    avgCpc: number
    avgConversionRate: number
    avgRoas: number
  }
}

export interface ReportOptions {
  format: 'PDF' | 'EXCEL'
  includeCharts: boolean
  includeRecommendations: boolean
  customStyling?: boolean
}

export class ReportService {
  /**
   * Génère un rapport complet
   */
  static async generateReport(
    clientAccountId: string,
    period: { start: Date; end: Date },
    options: ReportOptions
  ): Promise<Buffer> {
    try {
      // Récupérer les données
      const reportData = await this.getReportData(clientAccountId, period)
      
      // Générer le rapport selon le format demandé
      if (options.format === 'PDF') {
        return await this.generatePDFReport(reportData, options)
      } else {
        return await this.generateExcelReport(reportData, options)
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
      throw error
    }
  }

  /**
   * Récupère les données pour le rapport
   */
  private static async getReportData(
    clientAccountId: string,
    period: { start: Date; end: Date }
  ): Promise<ReportData> {
    const clientAccount = await db.clientAccount.findUnique({
      where: { id: clientAccountId },
      include: {
        user: true,
        company: true,
        campaigns: true
      }
    })

    if (!clientAccount) {
      throw new Error('Client account not found')
    }

    // Filtrer les campagnes par période
    const campaigns = clientAccount.campaigns.filter(campaign => {
      const campaignDate = new Date(campaign.createdAt)
      return campaignDate >= period.start && campaignDate <= period.end
    })

    // Calculer les métriques pour chaque campagne
    const campaignsWithMetrics = campaigns.map(campaign => {
      // TODO: Récupérer les vraies métriques depuis Google Ads API
      const metrics = this.getSimulatedMetrics(campaign)
      
      return {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        budget: campaign.budget,
        spent: metrics.spent,
        impressions: metrics.impressions,
        clicks: metrics.clicks,
        conversions: metrics.conversions,
        ctr: metrics.ctr,
        cpc: metrics.cpc,
        conversionRate: metrics.conversionRate,
        roas: metrics.roas
      }
    })

    // Calculer le résumé
    const summary = this.calculateSummary(campaignsWithMetrics)

    return {
      clientName: clientAccount.company.name,
      period,
      campaigns: campaignsWithMetrics,
      summary
    }
  }

  /**
   * Génère un rapport PDF
   */
  private static async generatePDFReport(
    data: ReportData,
    options: ReportOptions
  ): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    const html = this.generateReportHTML(data, options)
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    })

    await browser.close()
    return pdf
  }

  /**
   * Génère un rapport Excel
   */
  private static async generateExcelReport(
    data: ReportData,
    options: ReportOptions
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    
    // Feuille de résumé
    const summarySheet = workbook.addWorksheet('Résumé')
    this.addSummarySheet(summarySheet, data)
    
    // Feuille des campagnes
    const campaignsSheet = workbook.addWorksheet('Campagnes')
    this.addCampaignsSheet(campaignsSheet, data)
    
    // Feuille des recommandations
    if (options.includeRecommendations) {
      const recommendationsSheet = workbook.addWorksheet('Recommandations')
      this.addRecommendationsSheet(recommendationsSheet, data)
    }

    return await workbook.xlsx.writeBuffer()
  }

  /**
   * Génère le HTML pour le rapport PDF
   */
  private static generateReportHTML(data: ReportData, options: ReportOptions): string {
    const periodText = `${format(data.period.start, 'dd/MM/yyyy', { locale: fr })} - ${format(data.period.end, 'dd/MM/yyyy', { locale: fr })}`
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport Google Ads - ${data.clientName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #1d4ed8;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1d4ed8;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #1d4ed8;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            color: #1d4ed8;
            font-size: 16px;
          }
          .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .campaigns-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .campaigns-table th,
          .campaigns-table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          .campaigns-table th {
            background: #1d4ed8;
            color: white;
            font-weight: 600;
          }
          .campaigns-table tr:nth-child(even) {
            background: #f9fafb;
          }
          .status-active { color: #059669; }
          .status-paused { color: #d97706; }
          .recommendations {
            background: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          .recommendations h3 {
            margin-top: 0;
            color: #92400e;
          }
          .recommendations ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .recommendations li {
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport Google Ads</h1>
          <p><strong>Client:</strong> ${data.clientName}</p>
          <p><strong>Période:</strong> ${periodText}</p>
          <p><strong>Généré le:</strong> ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <h3>Dépenses Totales</h3>
            <div class="value">${data.summary.totalSpend.toFixed(2)}€</div>
          </div>
          <div class="summary-card">
            <h3>Impressions</h3>
            <div class="value">${data.summary.totalImpressions.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <h3>Clics</h3>
            <div class="value">${data.summary.totalClicks.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <h3>Conversions</h3>
            <div class="value">${data.summary.totalConversions.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <h3>CTR Moyen</h3>
            <div class="value">${data.summary.avgCtr.toFixed(2)}%</div>
          </div>
          <div class="summary-card">
            <h3>CPC Moyen</h3>
            <div class="value">${data.summary.avgCpc.toFixed(2)}€</div>
          </div>
          <div class="summary-card">
            <h3>Taux de Conversion</h3>
            <div class="value">${data.summary.avgConversionRate.toFixed(2)}%</div>
          </div>
          <div class="summary-card">
            <h3>ROAS Moyen</h3>
            <div class="value">${data.summary.avgRoas.toFixed(2)}x</div>
          </div>
        </div>

        <h2>Détail des Campagnes</h2>
        <table class="campaigns-table">
          <thead>
            <tr>
              <th>Campagne</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Budget</th>
              <th>Dépensé</th>
              <th>Impressions</th>
              <th>Clics</th>
              <th>CTR</th>
              <th>CPC</th>
              <th>Conversions</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            ${data.campaigns.map(campaign => `
              <tr>
                <td>${campaign.name}</td>
                <td>${campaign.type}</td>
                <td class="status-${campaign.status.toLowerCase()}">${campaign.status}</td>
                <td>${campaign.budget.toFixed(2)}€</td>
                <td>${campaign.spent.toFixed(2)}€</td>
                <td>${campaign.impressions.toLocaleString()}</td>
                <td>${campaign.clicks.toLocaleString()}</td>
                <td>${campaign.ctr.toFixed(2)}%</td>
                <td>${campaign.cpc.toFixed(2)}€</td>
                <td>${campaign.conversions.toLocaleString()}</td>
                <td>${campaign.roas.toFixed(2)}x</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${options.includeRecommendations ? `
          <div class="recommendations">
            <h3>Recommandations d'Optimisation</h3>
            <ul>
              ${this.generateRecommendations(data).map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </body>
      </html>
    `
  }

  /**
   * Ajoute la feuille de résumé au Excel
   */
  private static addSummarySheet(sheet: ExcelJS.Worksheet, data: ReportData): void {
    sheet.columns = [
      { header: 'Métrique', key: 'metric', width: 20 },
      { header: 'Valeur', key: 'value', width: 15 }
    ]

    sheet.addRow({ metric: 'Client', value: data.clientName })
    sheet.addRow({ metric: 'Période', value: `${format(data.period.start, 'dd/MM/yyyy')} - ${format(data.period.end, 'dd/MM/yyyy')}` })
    sheet.addRow({ metric: '', value: '' })
    sheet.addRow({ metric: 'Dépenses Totales', value: `${data.summary.totalSpend.toFixed(2)}€` })
    sheet.addRow({ metric: 'Impressions', value: data.summary.totalImpressions.toLocaleString() })
    sheet.addRow({ metric: 'Clics', value: data.summary.totalClicks.toLocaleString() })
    sheet.addRow({ metric: 'Conversions', value: data.summary.totalConversions.toLocaleString() })
    sheet.addRow({ metric: 'CTR Moyen', value: `${data.summary.avgCtr.toFixed(2)}%` })
    sheet.addRow({ metric: 'CPC Moyen', value: `${data.summary.avgCpc.toFixed(2)}€` })
    sheet.addRow({ metric: 'Taux de Conversion', value: `${data.summary.avgConversionRate.toFixed(2)}%` })
    sheet.addRow({ metric: 'ROAS Moyen', value: `${data.summary.avgRoas.toFixed(2)}x` })
  }

  /**
   * Ajoute la feuille des campagnes au Excel
   */
  private static addCampaignsSheet(sheet: ExcelJS.Worksheet, data: ReportData): void {
    sheet.columns = [
      { header: 'Campagne', key: 'name', width: 25 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Statut', key: 'status', width: 12 },
      { header: 'Budget', key: 'budget', width: 12 },
      { header: 'Dépensé', key: 'spent', width: 12 },
      { header: 'Impressions', key: 'impressions', width: 12 },
      { header: 'Clics', key: 'clicks', width: 12 },
      { header: 'CTR', key: 'ctr', width: 10 },
      { header: 'CPC', key: 'cpc', width: 10 },
      { header: 'Conversions', key: 'conversions', width: 12 },
      { header: 'ROAS', key: 'roas', width: 10 }
    ]

    data.campaigns.forEach(campaign => {
      sheet.addRow({
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        budget: campaign.budget,
        spent: campaign.spent,
        impressions: campaign.impressions,
        clicks: campaign.clicks,
        ctr: campaign.ctr,
        cpc: campaign.cpc,
        conversions: campaign.conversions,
        roas: campaign.roas
      })
    })
  }

  /**
   * Ajoute la feuille des recommandations au Excel
   */
  private static addRecommendationsSheet(sheet: ExcelJS.Worksheet, data: ReportData): void {
    sheet.columns = [
      { header: 'Recommandation', key: 'recommendation', width: 50 },
      { header: 'Priorité', key: 'priority', width: 15 },
      { header: 'Impact Estimé', key: 'impact', width: 20 }
    ]

    const recommendations = this.generateRecommendations(data)
    recommendations.forEach(rec => {
      sheet.addRow({
        recommendation: rec,
        priority: 'Moyenne',
        impact: '+10-20%'
      })
    })
  }

  /**
   * Calcule le résumé des métriques
   */
  private static calculateSummary(campaigns: any[]): any {
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0)
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0)
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
      avgConversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      avgRoas: totalSpend > 0 ? (totalConversions * 50) / totalSpend : 0 // Valeur moyenne par conversion estimée à 50€
    }
  }

  /**
   * Génère des recommandations basées sur les données
   */
  private static generateRecommendations(data: ReportData): string[] {
    const recommendations = []

    if (data.summary.avgCtr < 2) {
      recommendations.push('Optimiser les annonces pour améliorer le CTR (actuellement faible)')
    }

    if (data.summary.avgCpc > 3) {
      recommendations.push('Réviser les enchères pour réduire le CPC moyen')
    }

    if (data.summary.avgConversionRate < 3) {
      recommendations.push('Améliorer les pages de destination pour augmenter le taux de conversion')
    }

    if (data.summary.avgRoas < 2) {
      recommendations.push('Optimiser le ciblage et les mots-clés pour améliorer le ROAS')
    }

    if (recommendations.length === 0) {
      recommendations.push('Les performances sont bonnes, continuer à surveiller et optimiser progressivement')
    }

    return recommendations
  }

  /**
   * Récupère des métriques simulées pour une campagne
   */
  private static getSimulatedMetrics(campaign: any): any {
    const baseBudget = campaign.budget || 1000
    const spent = baseBudget * (0.3 + Math.random() * 0.7) // 30-100% du budget
    const impressions = spent * (100 + Math.random() * 200) // 100-300 impressions par euro
    const clicks = impressions * (0.01 + Math.random() * 0.04) // 1-5% CTR
    const conversions = clicks * (0.02 + Math.random() * 0.08) // 2-10% conversion rate

    return {
      spent: Math.round(spent * 100) / 100,
      impressions: Math.round(impressions),
      clicks: Math.round(clicks),
      conversions: Math.round(conversions),
      ctr: Math.round((clicks / impressions) * 10000) / 100,
      cpc: Math.round((spent / clicks) * 100) / 100,
      conversionRate: Math.round((conversions / clicks) * 10000) / 100,
      roas: Math.round(((conversions * 50) / spent) * 100) / 100 // Valeur moyenne par conversion estimée à 50€
    }
  }
} 