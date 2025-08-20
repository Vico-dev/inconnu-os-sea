import { prisma } from '@/lib/db'
import { EmailService } from './email-service'

export interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  userId?: string
  clientAccountId?: string
  actionUrl?: string
  priority?: 'low' | 'medium' | 'high'
}

export class NotificationService {
  /**
   * Créer une notification en base de données
   */
  static async createNotification(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          userId: data.userId,
          clientAccountId: data.clientAccountId,
          actionUrl: data.actionUrl,
          priority: data.priority || 'medium',
          read: false
        }
      })

      console.log('📢 Notification créée:', notification.id)
      return notification
    } catch (error) {
      console.error('Erreur création notification:', error)
      throw error
    }
  }

  /**
   * Envoyer une notification par email
   */
  static async sendEmailNotification(
    email: string,
    firstName: string,
    data: NotificationData
  ) {
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: ${this.getTypeColor(data.type)};">${data.title}</h3>
          <p>Bonjour ${firstName},</p>
          <p>${data.message}</p>
          ${data.actionUrl ? `
            <a href="${data.actionUrl}" 
               style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Voir les détails
            </a>
          ` : ''}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Agence Inconnu - Spécialiste Google Ads
          </p>
        </div>
      `

      // Utiliser le service email existant ou créer une méthode spécifique
      await EmailService.sendNotificationEmail(email, firstName, data.title, data.message, data.actionUrl)

    } catch (error) {
      console.error('Erreur envoi notification email:', error)
    }
  }

  /**
   * Alertes de performance Google Ads
   */
  static async checkGoogleAdsPerformance(clientAccountId: string) {
    try {
      // Récupérer les données Google Ads récentes
      const campaigns = await prisma.campaign.findMany({
        where: { clientAccountId },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })

      for (const campaign of campaigns) {
        if (!campaign.metrics) continue

        const metrics = JSON.parse(campaign.metrics)
        
        // Vérifier les anomalies
        await this.checkAnomalies(clientAccountId, campaign, metrics)
      }

    } catch (error) {
      console.error('Erreur vérification performance:', error)
    }
  }

  /**
   * Détecter les anomalies de performance
   */
  private static async checkAnomalies(clientAccountId: string, campaign: any, metrics: any) {
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { id: clientAccountId },
      include: { user: true, company: true }
    })

    if (!clientAccount) return

    // Vérifier CPC élevé
    if (metrics.cpc && metrics.cpc > 5) { // CPC > 5€
      await this.createNotification({
        type: 'warning',
        title: 'CPC élevé détecté',
        message: `Le CPC de la campagne "${campaign.name}" est élevé (${metrics.cpc}€). Considérez une optimisation.`,
        clientAccountId,
        actionUrl: `/client/campaigns/${campaign.id}`,
        priority: 'medium'
      })
    }

    // Vérifier CTR bas
    if (metrics.ctr && metrics.ctr < 0.01) { // CTR < 1%
      await this.createNotification({
        type: 'warning',
        title: 'CTR faible détecté',
        message: `Le CTR de la campagne "${campaign.name}" est faible (${(metrics.ctr * 100).toFixed(2)}%). Améliorez vos annonces.`,
        clientAccountId,
        actionUrl: `/client/campaigns/${campaign.id}`,
        priority: 'medium'
      })
    }

    // Vérifier budget dépassé
    if (metrics.spend && campaign.budget && metrics.spend > campaign.budget * 0.9) {
      await this.createNotification({
        type: 'error',
        title: 'Budget presque épuisé',
        message: `La campagne "${campaign.name}" a utilisé ${((metrics.spend / campaign.budget) * 100).toFixed(1)}% de son budget.`,
        clientAccountId,
        actionUrl: `/client/campaigns/${campaign.id}`,
        priority: 'high'
      })
    }
  }

  /**
   * Générer un rapport hebdomadaire
   */
  static async generateWeeklyReport(clientAccountId: string) {
    try {
      const clientAccount = await prisma.clientAccount.findUnique({
        where: { id: clientAccountId },
        include: { user: true, company: true, campaigns: true }
      })

      if (!clientAccount) return

      // Calculer les KPIs de la semaine
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const recentCampaigns = clientAccount.campaigns.filter(
        c => new Date(c.updatedAt) > weekAgo
      )

      let totalSpend = 0
      let totalClicks = 0
      let totalImpressions = 0
      let totalConversions = 0

      for (const campaign of recentCampaigns) {
        if (campaign.metrics) {
          const metrics = JSON.parse(campaign.metrics)
          totalSpend += metrics.spend || 0
          totalClicks += metrics.clicks || 0
          totalImpressions += metrics.impressions || 0
          totalConversions += metrics.conversions || 0
        }
      }

      const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

      // Envoyer le rapport par email
      const reportHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">Rapport Hebdomadaire - ${clientAccount.company.name}</h3>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Résumé de la semaine</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong>Dépenses totales:</strong><br>
                ${totalSpend.toFixed(2)}€
              </div>
              <div>
                <strong>Clics totaux:</strong><br>
                ${totalClicks.toLocaleString()}
              </div>
              <div>
                <strong>CPC moyen:</strong><br>
                ${avgCpc.toFixed(2)}€
              </div>
              <div>
                <strong>CTR moyen:</strong><br>
                ${ctr.toFixed(2)}%
              </div>
              <div>
                <strong>Conversions:</strong><br>
                ${totalConversions}
              </div>
              <div>
                <strong>Taux de conversion:</strong><br>
                ${conversionRate.toFixed(2)}%
              </div>
            </div>
          </div>

          <a href="${process.env.NEXTAUTH_URL}/client" 
             style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Voir le dashboard complet
          </a>
        </div>
      `

      // Envoyer l'email
      await EmailService.sendWeeklyReport(
        clientAccount.user.email,
        clientAccount.user.firstName,
        clientAccount.company.name,
        reportHtml
      )

    } catch (error) {
      console.error('Erreur génération rapport hebdomadaire:', error)
    }
  }

  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(notificationId: string) {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true, readAt: new Date() }
      })
    } catch (error) {
      console.error('Erreur marquage notification lue:', error)
    }
  }

  /**
   * Récupérer les notifications non lues
   */
  static async getUnreadNotifications(userId: string) {
    try {
      return await prisma.notification.findMany({
        where: {
          userId,
          read: false
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Erreur récupération notifications:', error)
      return []
    }
  }

  /**
   * Couleur selon le type de notification
   */
  private static getTypeColor(type: string): string {
    switch (type) {
      case 'success': return '#059669'
      case 'warning': return '#d97706'
      case 'error': return '#dc2626'
      default: return '#1d4ed8'
    }
  }
} 