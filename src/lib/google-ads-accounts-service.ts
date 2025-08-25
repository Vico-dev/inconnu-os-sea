import { db } from './db'
import { GoogleAdsService } from './google-ads-service'

export interface GoogleAdsAccount {
  id: string
  customerId: string
  customerName: string
  isConnected: boolean
  isPrimary: boolean
  connectedAt?: Date
  createdAt: Date
  // Métriques récentes
  metrics?: {
    totalImpressions: number
    totalClicks: number
    totalCost: number
    totalConversions: number
    averageCtr: number
    averageCpc: number
    averageCpa: number
    averageRoas: number
  }
}

export interface AccountSelection {
  userId: string
  selectedAccountId: string
  context: 'CAMPAIGN_CREATOR' | 'CAMPAIGN_OPTIMIZER' | 'FEED_MANAGER' | 'REPORTS' | 'AB_TESTS'
}

export class GoogleAdsAccountsService {
  /**
   * Récupère tous les comptes Google Ads d'un utilisateur
   */
  static async getUserAccounts(userId: string): Promise<GoogleAdsAccount[]> {
    try {
      const connections = await db.googleAdsConnection.findMany({
        where: { userId },
        orderBy: [
          { isPrimary: 'desc' },
          { createdAt: 'desc' }
        ]
      })

      const accounts: GoogleAdsAccount[] = []

      for (const connection of connections) {
        // Récupérer les métriques si le compte est connecté
        let metrics = undefined
        if (connection.isConnected && connection.refreshToken) {
          try {
            metrics = await GoogleAdsService.getAccountMetrics(
              connection.customerId,
              connection.refreshToken
            )
          } catch (error) {
            console.error(`Erreur lors de la récupération des métriques pour ${connection.customerId}:`, error)
          }
        }

        accounts.push({
          id: connection.id,
          customerId: connection.customerId,
          customerName: connection.customerName,
          isConnected: connection.isConnected,
          isPrimary: connection.isPrimary,
          connectedAt: connection.connectedAt || undefined,
          createdAt: connection.createdAt,
          metrics
        })
      }

      return accounts
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes Google Ads:', error)
      throw error
    }
  }

  /**
   * Récupère le compte principal d'un utilisateur
   */
  static async getPrimaryAccount(userId: string): Promise<GoogleAdsAccount | null> {
    try {
      const connection = await db.googleAdsConnection.findFirst({
        where: { 
          userId,
          isPrimary: true,
          isConnected: true
        }
      })

      if (!connection) {
        return null
      }

      // Récupérer les métriques
      let metrics = undefined
      if (connection.refreshToken) {
        try {
          metrics = await GoogleAdsService.getAccountMetrics(
            connection.customerId,
            connection.refreshToken
          )
        } catch (error) {
          console.error(`Erreur lors de la récupération des métriques pour ${connection.customerId}:`, error)
        }
      }

      return {
        id: connection.id,
        customerId: connection.customerId,
        customerName: connection.customerName,
        isConnected: connection.isConnected,
        isPrimary: connection.isPrimary,
        connectedAt: connection.connectedAt || undefined,
        createdAt: connection.createdAt,
        metrics
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du compte principal:', error)
      throw error
    }
  }

  /**
   * Ajoute un nouveau compte Google Ads
   */
  static async addAccount(
    userId: string,
    customerId: string,
    customerName: string,
    accessToken: string,
    refreshToken: string,
    isPrimary: boolean = false
  ): Promise<GoogleAdsAccount> {
    try {
      // Si c'est le compte principal, désactiver les autres comptes principaux
      if (isPrimary) {
        await db.googleAdsConnection.updateMany({
          where: { userId, isPrimary: true },
          data: { isPrimary: false }
        })
      }

      const connection = await db.googleAdsConnection.create({
        data: {
          userId,
          customerId,
          customerName,
          accessToken,
          refreshToken,
          isConnected: true,
          isPrimary,
          connectedAt: new Date()
        }
      })

      return {
        id: connection.id,
        customerId: connection.customerId,
        customerName: connection.customerName,
        isConnected: connection.isConnected,
        isPrimary: connection.isPrimary,
        connectedAt: connection.connectedAt || undefined,
        createdAt: connection.createdAt
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du compte Google Ads:', error)
      throw error
    }
  }

  /**
   * Définit un compte comme principal
   */
  static async setPrimaryAccount(userId: string, accountId: string): Promise<void> {
    try {
      // Désactiver tous les autres comptes principaux
      await db.googleAdsConnection.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false }
      })

      // Définir le nouveau compte principal
      await db.googleAdsConnection.update({
        where: { id: accountId, userId },
        data: { isPrimary: true }
      })
    } catch (error) {
      console.error('Erreur lors de la définition du compte principal:', error)
      throw error
    }
  }

  /**
   * Supprime un compte Google Ads
   */
  static async removeAccount(userId: string, accountId: string): Promise<void> {
    try {
      const connection = await db.googleAdsConnection.findFirst({
        where: { id: accountId, userId }
      })

      if (!connection) {
        throw new Error('Compte Google Ads non trouvé')
      }

      // Si c'était le compte principal, définir un autre compte comme principal
      if (connection.isPrimary) {
        const otherAccount = await db.googleAdsConnection.findFirst({
          where: { 
            userId,
            id: { not: accountId },
            isConnected: true
          },
          orderBy: { createdAt: 'desc' }
        })

        if (otherAccount) {
          await db.googleAdsConnection.update({
            where: { id: otherAccount.id },
            data: { isPrimary: true }
          })
        }
      }

      await db.googleAdsConnection.delete({
        where: { id: accountId, userId }
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du compte Google Ads:', error)
      throw error
    }
  }

  /**
   * Sauvegarde la sélection d'un compte pour un contexte spécifique
   */
  static async saveAccountSelection(selection: AccountSelection): Promise<void> {
    try {
      // Vérifier que le compte appartient bien à l'utilisateur
      const connection = await db.googleAdsConnection.findFirst({
        where: { 
          id: selection.selectedAccountId,
          userId: selection.userId
        }
      })

      if (!connection) {
        throw new Error('Compte Google Ads non trouvé ou non autorisé')
      }

      // Sauvegarder la sélection (pourrait être dans localStorage côté client ou en base)
      // Pour l'instant, on utilise localStorage côté client
      console.log('Sélection sauvegardée:', selection)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la sélection:', error)
      throw error
    }
  }

  /**
   * Récupère la sélection d'un compte pour un contexte spécifique
   */
  static async getAccountSelection(userId: string, context: string): Promise<string | null> {
    try {
      // Pour l'instant, on utilise localStorage côté client
      // En production, on pourrait stocker en base de données
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de la sélection:', error)
      return null
    }
  }

  /**
   * Vérifie si un utilisateur a des comptes Google Ads connectés
   */
  static async hasConnectedAccounts(userId: string): Promise<boolean> {
    try {
      const count = await db.googleAdsConnection.count({
        where: { 
          userId,
          isConnected: true
        }
      })
      return count > 0
    } catch (error) {
      console.error('Erreur lors de la vérification des comptes connectés:', error)
      return false
    }
  }

  /**
   * Récupère les statistiques des comptes Google Ads d'un utilisateur
   */
  static async getAccountsStats(userId: string): Promise<{
    totalAccounts: number
    connectedAccounts: number
    primaryAccount: GoogleAdsAccount | null
    totalImpressions: number
    totalClicks: number
    totalCost: number
    totalConversions: number
  }> {
    try {
      const accounts = await this.getUserAccounts(userId)
      const connectedAccounts = accounts.filter(acc => acc.isConnected)
      const primaryAccount = accounts.find(acc => acc.isPrimary) || null

      // Calculer les totaux
      const totalImpressions = connectedAccounts.reduce((sum, acc) => sum + (acc.metrics?.totalImpressions || 0), 0)
      const totalClicks = connectedAccounts.reduce((sum, acc) => sum + (acc.metrics?.totalClicks || 0), 0)
      const totalCost = connectedAccounts.reduce((sum, acc) => sum + (acc.metrics?.totalCost || 0), 0)
      const totalConversions = connectedAccounts.reduce((sum, acc) => sum + (acc.metrics?.totalConversions || 0), 0)

      return {
        totalAccounts: accounts.length,
        connectedAccounts: connectedAccounts.length,
        primaryAccount,
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw error
    }
  }

  /**
   * Rafraîchit les tokens d'accès expirés
   */
  static async refreshExpiredTokens(userId: string): Promise<void> {
    try {
      const expiredConnections = await db.googleAdsConnection.findMany({
        where: {
          userId,
          isConnected: true,
          tokenExpiry: {
            lt: new Date()
          }
        }
      })

      for (const connection of expiredConnections) {
        try {
          // Utiliser le refresh token pour obtenir un nouveau access token
          // Cette logique dépend de l'implémentation de Google Ads API
          console.log(`Rafraîchissement du token pour ${connection.customerId}`)
          
          // TODO: Implémenter le rafraîchissement des tokens
          // const newTokens = await GoogleAdsService.refreshTokens(connection.refreshToken)
          
          // await db.googleAdsConnection.update({
          //   where: { id: connection.id },
          //   data: {
          //     accessToken: newTokens.accessToken,
          //     tokenExpiry: newTokens.expiry
          //   }
          // })
        } catch (error) {
          console.error(`Erreur lors du rafraîchissement du token pour ${connection.customerId}:`, error)
          
          // Marquer la connexion comme déconnectée
          await db.googleAdsConnection.update({
            where: { id: connection.id },
            data: { isConnected: false }
          })
        }
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des tokens:', error)
      throw error
    }
  }
} 