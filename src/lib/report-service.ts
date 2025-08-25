import puppeteer from 'puppeteer'
import ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { GoogleAdsService } from './google-ads-service'
import { db } from './db'

export interface ReportData {
  clientName: string
  period: {
    start: Date
    end: Date
  }
  campaigns: any[]
  metrics: {
    totalImpressions: number
    totalClicks: number
    totalCost: number
    totalConversions: number
    averageCtr: number
    averageCpc: number
    averageCpa: number
    averageRoas: number
  }
  recommendations: any[]
}

export interface ReportOptions {
  format: 'PDF' | 'EXCEL'
  includeCharts?: boolean
  includeRecommendations?: boolean
  customPeriod?: {
    start: Date
    end: Date
  }
}

export class ReportService {
  /**
   * Génère un rapport complet pour un client
   */
  static async generateClientReport(
    clientAccountId: string, 
    options: ReportOptions = { format: 'PDF' }
  ): Promise<Buffer> {
    try {
      // Récupérer les données du client
      const clientAccount = await db.clientAccount.findUnique({
        where: { id: clientAccountId },
        include: {
          user: true,
          company: true,
          campaigns: true
        }
      })

      if (!clientAccount) {
        throw new Error('Compte client non trouvé')
      }

      // Récupérer les données Google Ads si connecté
      let googleAdsData = null
      if (clientAccount.googleAdsConnected) {
        googleAdsData = await this.getGoogleAdsData(clientAccount)
      }

      // Préparer les données du rapport
      const reportData: ReportData = {
        clientName: clientAccount.company?.name || clientAccount.user.firstName + ' ' + clientAccount.user.lastName,
        period: {
          start: options.customPeriod?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
          end: options.customPeriod?.end || new Date()
        },
        campaigns: clientAccount.campaigns || [],
        metrics: googleAdsData?.metrics || this.getDefaultMetrics(),
        recommendations: googleAdsData?.recommendations || []
      }

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
   * Génère un rapport PDF
   */
  private static async generatePDFReport(reportData: ReportData, options: ReportOptions): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    const html = this.generateReportHTML(reportData, options)
    await page.setContent(html)

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
    return Buffer.from(pdf)
  }

  /**
   * Génère un rapport Excel
   */
  private static async generateExcelReport(reportData: ReportData, options: ReportOptions): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    
    // Feuille de synthèse
    const summarySheet = workbook.addWorksheet('Synthèse')
    this.addSummarySheet(summarySheet, reportData)

    // Feuille des campagnes
    const campaignsSheet = workbook.addWorksheet('Campagnes')
    this.addCampaignsSheet(campaignsSheet, reportData)

    // Feuille des métriques détaillées
    const metricsSheet = workbook.addWorksheet('Métriques')
    this.addMetricsSheet(metricsSheet, reportData)

    // Feuille des recommandations
    if (options.includeRecommendations && reportData.recommendations.length > 0) {
      const recommendationsSheet = workbook.addWorksheet('Recommandations')
      this.addRecommendationsSheet(recommendationsSheet, reportData)
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }

  /**
   * Génère le HTML pour le rapport PDF
   */
  private static generateReportHTML(reportData: ReportData, options: ReportOptions): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport Google Ads - ${reportData.clientName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .header h1 { color: #2563eb; margin: 0; }
          .header p { color: #6b7280; margin: 5px 0; }
          .section { margin: 30px 0; }
          .section h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
          .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          .metric-label { color: #6b7280; margin-top: 5px; }
          .campaigns-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .campaigns-table th, .campaigns-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          .campaigns-table th { background: #f3f4f6; font-weight: bold; }
          .recommendation { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; border-radius: 4px; }
          .recommendation h4 { margin: 0 0 10px 0; color: #92400e; }
          .recommendation p { margin: 0; color: #78350f; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rapport Google Ads</h1>
          <p><strong>Client:</strong> ${reportData.clientName}</p>
          <p><strong>Période:</strong> ${format(reportData.period.start, 'dd/MM/yyyy', { locale: fr })} - ${format(reportData.period.end, 'dd/MM/yyyy', { locale: fr })}</p>
          <p><strong>Généré le:</strong> ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
        </div>

        <div class="section">
          <h2>Synthèse des performances</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.totalImpressions.toLocaleString()}</div>
              <div class="metric-label">Impressions</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.totalClicks.toLocaleString()}</div>
              <div class="metric-label">Clics</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.averageCtr.toFixed(2)}%</div>
              <div class="metric-label">CTR moyen</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.totalCost.toFixed(2)}€</div>
              <div class="metric-label">Coût total</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.averageCpc.toFixed(2)}€</div>
              <div class="metric-label">CPC moyen</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.totalConversions.toLocaleString()}</div>
              <div class="metric-label">Conversions</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.averageCpa.toFixed(2)}€</div>
              <div class="metric-label">CPA moyen</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${reportData.metrics.averageRoas.toFixed(2)}x</div>
              <div class="metric-label">ROAS moyen</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Campagnes</h2>
          <table class="campaigns-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Budget</th>
                <th>Impressions</th>
                <th>Clics</th>
                <th>CTR</th>
                <th>Coût</th>
                <th>ROAS</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.campaigns.map(campaign => `
                <tr>
                  <td>${campaign.name}</td>
                  <td>${campaign.type}</td>
                  <td>${campaign.status}</td>
                  <td>${campaign.budget}€</td>
                  <td>${campaign.impressions?.toLocaleString() || 'N/A'}</td>
                  <td>${campaign.clicks?.toLocaleString() || 'N/A'}</td>
                  <td>${campaign.ctr?.toFixed(2) || 'N/A'}%</td>
                  <td>${campaign.cost?.toFixed(2) || 'N/A'}€</td>
                  <td>${campaign.roas?.toFixed(2) || 'N/A'}x</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${options.includeRecommendations && reportData.recommendations.length > 0 ? `
          <div class="section">
            <h2>Recommandations d'optimisation</h2>
            ${reportData.recommendations.map(rec => `
              <div class="recommendation">
                <h4>${rec.title}</h4>
                <p><strong>Impact estimé:</strong> ${rec.estimatedImprovement}% d'amélioration</p>
                <p>${rec.description}</p>
                <p><strong>Action recommandée:</strong> ${rec.action}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          <p>Rapport généré automatiquement par Inconnu OS</p>
          <p>Pour toute question, contactez votre Account Manager</p>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Ajoute la feuille de synthèse au rapport Excel
   */
  private static addSummarySheet(sheet: ExcelJS.Worksheet, reportData: ReportData) {
    // Titre
    sheet.addRow(['Rapport Google Ads - Synthèse'])
    sheet.addRow([])
    
    // Informations client
    sheet.addRow(['Client:', reportData.clientName])
    sheet.addRow(['Période:', `${format(reportData.period.start, 'dd/MM/yyyy')} - ${format(reportData.period.end, 'dd/MM/yyyy')}`])
    sheet.addRow(['Généré le:', format(new Date(), 'dd/MM/yyyy à HH:mm')])
    sheet.addRow([])

    // Métriques principales
    sheet.addRow(['Métriques principales'])
    sheet.addRow(['Impressions', 'Clics', 'CTR moyen', 'Coût total', 'CPC moyen', 'Conversions', 'CPA moyen', 'ROAS moyen'])
    sheet.addRow([
      reportData.metrics.totalImpressions,
      reportData.metrics.totalClicks,
      `${reportData.metrics.averageCtr.toFixed(2)}%`,
      `${reportData.metrics.totalCost.toFixed(2)}€`,
      `${reportData.metrics.averageCpc.toFixed(2)}€`,
      reportData.metrics.totalConversions,
      `${reportData.metrics.averageCpa.toFixed(2)}€`,
      `${reportData.metrics.averageRoas.toFixed(2)}x`
    ])

    // Formatage
    sheet.getCell('A1').font = { bold: true, size: 16 }
    sheet.getCell('A6').font = { bold: true, size: 14 }
    sheet.getCell('A7').font = { bold: true }
    sheet.getCell('A8').font = { bold: true }
  }

  /**
   * Ajoute la feuille des campagnes au rapport Excel
   */
  private static addCampaignsSheet(sheet: ExcelJS.Worksheet, reportData: ReportData) {
    sheet.addRow(['Détail des campagnes'])
    sheet.addRow([])
    
    // En-têtes
    sheet.addRow(['Nom', 'Type', 'Statut', 'Budget', 'Impressions', 'Clics', 'CTR', 'Coût', 'ROAS', 'Score d\'optimisation'])
    
    // Données des campagnes
    reportData.campaigns.forEach(campaign => {
      sheet.addRow([
        campaign.name,
        campaign.type,
        campaign.status,
        `${campaign.budget}€`,
        campaign.impressions || 0,
        campaign.clicks || 0,
        campaign.ctr ? `${campaign.ctr.toFixed(2)}%` : 'N/A',
        campaign.cost ? `${campaign.cost.toFixed(2)}€` : 'N/A',
        campaign.roas ? `${campaign.roas.toFixed(2)}x` : 'N/A',
        campaign.optimizationScore ? `${campaign.optimizationScore}%` : 'N/A'
      ])
    })

    // Formatage
    sheet.getCell('A1').font = { bold: true, size: 14 }
    sheet.getCell('A3').font = { bold: true }
  }

  /**
   * Ajoute la feuille des métriques au rapport Excel
   */
  private static addMetricsSheet(sheet: ExcelJS.Worksheet, reportData: ReportData) {
    sheet.addRow(['Métriques détaillées'])
    sheet.addRow([])
    
    // Métriques par jour (simulées)
    const days = 30
    sheet.addRow(['Date', 'Impressions', 'Clics', 'CTR', 'Coût', 'Conversions', 'CPA', 'ROAS'])
    
    for (let i = 0; i < days; i++) {
      const date = new Date(reportData.period.end)
      date.setDate(date.getDate() - (days - i - 1))
      
      // Simuler des données quotidiennes
      const dailyImpressions = Math.floor(reportData.metrics.totalImpressions / days * (0.8 + Math.random() * 0.4))
      const dailyClicks = Math.floor(reportData.metrics.totalClicks / days * (0.8 + Math.random() * 0.4))
      const dailyCTR = dailyImpressions > 0 ? (dailyClicks / dailyImpressions) * 100 : 0
      const dailyCost = (reportData.metrics.totalCost / days) * (0.8 + Math.random() * 0.4)
      const dailyConversions = Math.floor(reportData.metrics.totalConversions / days * (0.8 + Math.random() * 0.4))
      const dailyCPA = dailyConversions > 0 ? dailyCost / dailyConversions : 0
      const dailyROAS = dailyConversions > 0 ? (dailyConversions * 50) / dailyCost : 0 // Simuler un CA de 50€ par conversion
      
      sheet.addRow([
        format(date, 'dd/MM/yyyy'),
        dailyImpressions,
        dailyClicks,
        `${dailyCTR.toFixed(2)}%`,
        `${dailyCost.toFixed(2)}€`,
        dailyConversions,
        `${dailyCPA.toFixed(2)}€`,
        `${dailyROAS.toFixed(2)}x`
      ])
    }

    // Formatage
    sheet.getCell('A1').font = { bold: true, size: 14 }
    sheet.getCell('A3').font = { bold: true }
  }

  /**
   * Ajoute la feuille des recommandations au rapport Excel
   */
  private static addRecommendationsSheet(sheet: ExcelJS.Worksheet, reportData: ReportData) {
    sheet.addRow(['Recommandations d\'optimisation'])
    sheet.addRow([])
    
    // En-têtes
    sheet.addRow(['Type', 'Priorité', 'Titre', 'Description', 'Impact estimé', 'Action recommandée'])
    
    // Données des recommandations
    reportData.recommendations.forEach(rec => {
      sheet.addRow([
        rec.type,
        rec.priority,
        rec.title,
        rec.description,
        `${rec.estimatedImprovement}%`,
        rec.action
      ])
    })

    // Formatage
    sheet.getCell('A1').font = { bold: true, size: 14 }
    sheet.getCell('A3').font = { bold: true }
  }

  /**
   * Récupère les données Google Ads d'un client
   */
  private static async getGoogleAdsData(clientAccount: any) {
    try {
      if (!clientAccount.googleAdsConnection) {
        return null
      }

      const { customerId, refreshToken } = clientAccount.googleAdsConnection
      
      // Récupérer les campagnes
      const campaigns = await GoogleAdsService.getCampaigns(customerId, refreshToken)
      
      // Récupérer les métriques globales
      const metrics = await GoogleAdsService.getAccountMetrics(customerId, refreshToken)
      
      // Récupérer les recommandations
      const recommendations = await GoogleAdsService.getOptimizationRecommendations(customerId, refreshToken)

      return {
        campaigns,
        metrics,
        recommendations
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données Google Ads:', error)
      return null
    }
  }

  /**
   * Retourne des métriques par défaut si pas de données Google Ads
   */
  private static getDefaultMetrics() {
    return {
      totalImpressions: 0,
      totalClicks: 0,
      totalCost: 0,
      totalConversions: 0,
      averageCtr: 0,
      averageCpc: 0,
      averageCpa: 0,
      averageRoas: 0
    }
  }
} 