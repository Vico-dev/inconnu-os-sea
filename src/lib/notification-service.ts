import { db } from './db'
import { sendEmail } from './email'

export interface Notification {
  id: string
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS'
  title: string
  message: string
  userId: string
  read: boolean
  createdAt: Date
  metadata?: any
}

export interface AlertRule {
  id: string
  name: string
  description: string
  condition: {
    metric: string
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
    threshold: number
    timeframe: string // '1h', '24h', '7d', '30d'
  }
  actions: {
    type: 'EMAIL' | 'SLACK' | 'DASHBOARD' | 'SMS'
    recipients: string[]
    template?: string
  }[]
  enabled: boolean
  lastTriggered?: Date
  triggerCount: number
}

export class NotificationService {
  /**
   * Crée une notification dans le dashboard
   */
  static async createNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> {
    return await db.notification.create({
      data: {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        userId: notification.userId,
        read: false,
        metadata: notification.metadata
      }
    })
  }

  /**
   * Marque une notification comme lue
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await db.notification.update({
      where: { id: notificationId },
      data: { read: true }
    })
  }

  /**
   * Récupère les notifications d'un utilisateur
   */
  static async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  /**
   * Récupère les notifications non lues d'un utilisateur
   */
  static async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return await db.notification.findMany({
      where: { 
        userId,
        read: false
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Crée une alerte basée sur une règle
   */
  static async createAlert(rule: AlertRule, data: any): Promise<void> {
    try {
      // Créer la notification dans le dashboard
      await this.createNotification({
        type: 'ALERT',
        title: `Alerte: ${rule.name}`,
        message: `La condition "${rule.condition.metric} ${rule.condition.operator} ${rule.condition.threshold}" a été déclenchée.`,
          userId: data.userId,
        metadata: {
          ruleId: rule.id,
          triggeredValue: data.currentValue,
          threshold: rule.condition.threshold
        }
      })

      // Exécuter les actions configurées
      for (const action of rule.actions) {
        await this.executeAlertAction(action, rule, data)
      }

      // Mettre à jour le compteur de déclenchements
      await this.updateAlertRuleStats(rule.id)

    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error)
    }
  }

  /**
   * Exécute une action d'alerte
   */
  private static async executeAlertAction(action: any, rule: AlertRule, data: any): Promise<void> {
    switch (action.type) {
      case 'EMAIL':
        await this.sendEmailAlert(action, rule, data)
        break
      case 'SLACK':
        await this.sendSlackAlert(action, rule, data)
        break
      case 'SMS':
        await this.sendSMSAlert(action, rule, data)
        break
      case 'DASHBOARD':
        // Déjà géré par createNotification
        break
    }
  }

  /**
   * Envoie une alerte par email
   */
  private static async sendEmailAlert(action: any, rule: AlertRule, data: any): Promise<void> {
    const subject = `🚨 Alerte Google Ads: ${rule.name}`
    const html = `
      <h2>🚨 Alerte Google Ads</h2>
      <p><strong>Règle:</strong> ${rule.name}</p>
      <p><strong>Description:</strong> ${rule.description}</p>
      <p><strong>Condition déclenchée:</strong> ${rule.condition.metric} ${rule.condition.operator} ${rule.condition.threshold}</p>
      <p><strong>Valeur actuelle:</strong> ${data.currentValue}</p>
      <p><strong>Campagne:</strong> ${data.campaignName || 'N/A'}</p>
      <p><strong>Client:</strong> ${data.clientName || 'N/A'}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
      <br>
      <p>Connectez-vous à votre dashboard pour plus de détails.</p>
    `

    for (const recipient of action.recipients) {
      await sendEmail({
        to: recipient,
        subject,
        html
      })
    }
  }

  /**
   * Envoie une alerte Slack
   */
  private static async sendSlackAlert(action: any, rule: AlertRule, data: any): Promise<void> {
    // TODO: Implémenter l'intégration Slack
    console.log('Slack alert:', {
      channel: action.recipients[0],
      rule: rule.name,
      data
    })
  }

  /**
   * Envoie une alerte SMS
   */
  private static async sendSMSAlert(action: any, rule: AlertRule, data: any): Promise<void> {
    // TODO: Implémenter l'intégration SMS
    console.log('SMS alert:', {
      recipients: action.recipients,
      rule: rule.name,
      data
    })
  }

  /**
   * Met à jour les statistiques d'une règle d'alerte
   */
  private static async updateAlertRuleStats(ruleId: string): Promise<void> {
    // TODO: Implémenter la mise à jour des stats
    console.log('Updating alert rule stats for:', ruleId)
  }

  /**
   * Vérifie toutes les règles d'alerte actives
   */
  static async checkAlertRules(): Promise<void> {
    try {
      const activeRules = await this.getActiveAlertRules()
      
      for (const rule of activeRules) {
        await this.evaluateAlertRule(rule)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des alertes:', error)
    }
  }

  /**
   * Récupère toutes les règles d'alerte actives
   */
  private static async getActiveAlertRules(): Promise<AlertRule[]> {
    // TODO: Récupérer depuis la base de données
    return [
      {
        id: '1',
        name: 'CTR faible',
        description: 'Alerte quand le CTR est inférieur à 2%',
        condition: {
          metric: 'ctr',
          operator: 'lt',
          threshold: 2.0,
          timeframe: '24h'
        },
        actions: [
          {
            type: 'EMAIL',
            recipients: ['admin@example.com']
          },
          {
            type: 'DASHBOARD',
            recipients: []
          }
        ],
        enabled: true,
        triggerCount: 0
      },
      {
        id: '2',
        name: 'Budget dépassé',
        description: 'Alerte quand 80% du budget est dépensé',
        condition: {
          metric: 'budget_spent_percentage',
          operator: 'gte',
          threshold: 80,
          timeframe: '24h'
        },
        actions: [
          {
            type: 'EMAIL',
            recipients: ['admin@example.com']
          },
          {
            type: 'SLACK',
            recipients: ['#alerts']
          }
        ],
        enabled: true,
        triggerCount: 0
      }
    ]
  }

  /**
   * Évalue une règle d'alerte
   */
  private static async evaluateAlertRule(rule: AlertRule): Promise<void> {
    try {
      // TODO: Récupérer les vraies données depuis Google Ads API
      const currentData = await this.getCurrentMetrics(rule.condition.metric)
      
      const shouldTrigger = this.evaluateCondition(rule.condition, currentData)
      
      if (shouldTrigger) {
        await this.createAlert(rule, {
          currentValue: currentData.value,
          campaignName: currentData.campaignName,
          clientName: currentData.clientName,
          userId: currentData.userId
        })
      }
    } catch (error) {
      console.error(`Erreur lors de l'évaluation de la règle ${rule.name}:`, error)
    }
  }

  /**
   * Récupère les métriques actuelles
   */
  private static async getCurrentMetrics(metric: string): Promise<any> {
    // TODO: Intégrer avec Google Ads API
    return {
      value: Math.random() * 10, // Simulé
      campaignName: 'Campagne Test',
      clientName: 'Client Test',
      userId: 'user_123'
    }
  }

  /**
   * Évalue une condition d'alerte
   */
  private static evaluateCondition(condition: any, data: any): boolean {
    const currentValue = data.value
    
    switch (condition.operator) {
      case 'gt':
        return currentValue > condition.threshold
      case 'lt':
        return currentValue < condition.threshold
      case 'eq':
        return currentValue === condition.threshold
      case 'gte':
        return currentValue >= condition.threshold
      case 'lte':
        return currentValue <= condition.threshold
      default:
        return false
    }
  }

  /**
   * Crée une règle d'alerte
   */
  static async createAlertRule(rule: Omit<AlertRule, 'id' | 'triggerCount'>): Promise<AlertRule> {
    // TODO: Sauvegarder dans la base de données
    return {
      ...rule,
      id: 'rule_' + Date.now(),
      triggerCount: 0
    }
  }

  /**
   * Supprime une règle d'alerte
   */
  static async deleteAlertRule(ruleId: string): Promise<void> {
    // TODO: Supprimer de la base de données
    console.log('Deleting alert rule:', ruleId)
  }
} 